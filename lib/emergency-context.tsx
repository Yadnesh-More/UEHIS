'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type {
  AlertPriority,
  AmbulanceUnit,
  EmergencyCase,
  EmergencyPersistedState,
  HospitalUnit,
  SeverityRole,
  SystemAlert,
} from '@/lib/emergency-types'
import { computeLocalTriage } from '@/lib/ai/local-triage'
import { DEFAULT_GEMINI_MODEL_LABEL, type TriageAIResult, type TriageAPIResponse } from '@/lib/ai/triage-result'
import { getDefaultEmergencyState, roleDefaults } from '@/lib/emergency-seed'

export type { SeverityRole, AlertPriority, EmergencyCase, AmbulanceUnit, HospitalUnit, SystemAlert } from '@/lib/emergency-types'

interface EmergencyContextValue {
  cases: EmergencyCase[]
  ambulances: AmbulanceUnit[]
  hospitals: HospitalUnit[]
  alerts: SystemAlert[]
  activeCaseId: number
  bloodUnits: { oNegative: number; abNegative: number }
  aiLoading: boolean
  aiError: string | null
  dbLoading: boolean
  dbError: string | null
  createCase: (payload: { location: string; caseType: string; estimatedVictims: number; description: string }) => void
  setActiveCase: (caseId: number) => void
  runAITriage: (caseId?: number) => void
  reassignAmbulance: (ambulanceId: string, role: SeverityRole, hospital: string) => void
  applyRecommendation: () => void
  redirectAmbulances: () => void
  requestBloodUnits: () => void
  toggleHospitalIntake: (hospitalName: string) => void
}

const EmergencyContext = createContext<EmergencyContextValue | undefined>(undefined)

const DEBOUNCE_MS = 1400

export function EmergencyProvider({ children }: { children: React.ReactNode }) {
  const defaults = useMemo(() => getDefaultEmergencyState(), [])
  const [cases, setCases] = useState<EmergencyCase[]>(defaults.cases)
  const [activeCaseId, setActiveCaseId] = useState(defaults.activeCaseId)
  const [ambulances, setAmbulances] = useState<AmbulanceUnit[]>(defaults.ambulances)
  const [hospitals, setHospitals] = useState<HospitalUnit[]>(defaults.hospitals)
  const [alerts, setAlerts] = useState<SystemAlert[]>(defaults.alerts)
  const [bloodUnits, setBloodUnits] = useState(defaults.bloodUnits)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [dbLoading, setDbLoading] = useState(true)
  const [dbError, setDbError] = useState<string | null>(null)

  const hospitalsRef = useRef(hospitals)
  hospitalsRef.current = hospitals
  const casesRef = useRef(cases)
  casesRef.current = cases
  const ambulancesRef = useRef(ambulances)
  ambulancesRef.current = ambulances
  const activeCaseIdRef = useRef(activeCaseId)
  activeCaseIdRef.current = activeCaseId

  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const allowPersist = useRef(false)
  const persistFailureLogged = useRef(false)

  const snapshot = useMemo<EmergencyPersistedState>(
    () => ({
      cases,
      ambulances,
      hospitals,
      alerts,
      activeCaseId,
      bloodUnits,
    }),
    [cases, ambulances, hospitals, alerts, activeCaseId, bloodUnits]
  )

  const schedulePersist = useCallback((state: EmergencyPersistedState) => {
    if (!allowPersist.current) return
    if (persistTimer.current) clearTimeout(persistTimer.current)
    persistTimer.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/emergency', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state),
        })
        const raw = await res.text()
        if (!res.ok) {
          let hint: string | undefined
          try {
            const j = JSON.parse(raw) as { hint?: string; error?: string }
            hint = j.hint ?? j.error
          } catch {
            hint = raw
          }
          throw new Error(hint ?? raw)
        }
        persistFailureLogged.current = false
      } catch (e) {
        if (!persistFailureLogged.current) {
          persistFailureLogged.current = true
          console.error('Failed to persist emergency state', e)
          setDbError((prev) => {
            if (prev) return prev
            const msg = e instanceof Error ? e.message : String(e)
            return `Not saving to database: ${msg}`
          })
        }
      }
    }, DEBOUNCE_MS)
  }, [])

  useEffect(() => {
    schedulePersist(snapshot)
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current)
    }
  }, [snapshot, schedulePersist])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/emergency')
        if (!res.ok) {
          const raw = await res.text()
          let hint = raw
          try {
            const j = JSON.parse(raw) as { hint?: string; error?: string }
            if (j.hint && j.error) hint = `${j.error}: ${j.hint}`
            else if (j.hint) hint = j.hint
            else if (j.error) hint = j.error
          } catch {
            /* use raw */
          }
          throw new Error(hint)
        }
        const data = (await res.json()) as EmergencyPersistedState
        if (cancelled) return
        setCases(data.cases)
        setAmbulances(data.ambulances)
        setHospitals(data.hospitals)
        setAlerts(data.alerts)
        setActiveCaseId(data.activeCaseId)
        setBloodUnits(data.bloodUnits)
        setDbError(null)
      } catch (e) {
        console.error('Failed to load emergency state', e)
        if (!cancelled) {
          setDbError('Could not load saved data; showing defaults until the database is reachable.')
        }
      } finally {
        if (!cancelled) {
          allowPersist.current = true
          setDbLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const addAlert = useCallback((title: string, detail: string, priority: AlertPriority) => {
    setAlerts((prev) =>
      [{ id: `${Date.now()}-${Math.random()}`, title, detail, priority, createdAt: Date.now() }, ...prev]
        .sort((a, b) => {
          const rank = { Critical: 3, High: 2, Medium: 1 }
          return rank[b.priority] - rank[a.priority] || b.createdAt - a.createdAt
        })
        .slice(0, 8)
    )
  }, [])

  const getBestAcceptingHospital = useCallback((fallbackName: string) => {
    const accepting = hospitalsRef.current.filter((h) => h.acceptsIncoming)
    if (accepting.length === 0) return fallbackName
    const preferred = accepting.find((h) => h.name === fallbackName)
    if (preferred) return preferred.name
    return [...accepting].sort((a, b) => a.capacity - b.capacity)[0].name
  }, [])

  const runAITriage = useCallback(
    async (caseId?: number) => {
      const targetId = caseId ?? activeCaseIdRef.current
      setAiLoading(true)
      setAiError(null)
      const timeStr = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      const applyResult = (result: TriageAIResult, source: TriageAPIResponse['source']) => {
        const eventText =
          source === 'gemini' && result.timelineNote
            ? `Gemini (${DEFAULT_GEMINI_MODEL_LABEL}): ${result.timelineNote}`
            : source === 'gemini'
              ? 'Gemini triage: severity, routing, and ambulance plan updated'
              : 'Local fallback triage applied (check API key or network)'
        setCases((prev) =>
          prev.map((c) =>
            c.id !== targetId
              ? c
              : {
                  ...c,
                  severity: result.severity,
                  suggestedHospitals: result.suggestedHospitals,
                  timeline: [...c.timeline, { time: timeStr(), event: eventText }],
                }
          )
        )
        setAmbulances((prev) =>
          prev.map((unit) => {
            const u = result.ambulances.find((a) => a.id === unit.id)
            return u ? { ...unit, ...u } : unit
          })
        )
      }

      try {
        const c = casesRef.current.find((x) => x.id === targetId)
        if (!c) {
          setAiError('No case found for triage.')
          return
        }
        const hospitals = hospitalsRef.current
        const ambulances = ambulancesRef.current
        const res = await fetch('/api/ai/triage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseId: targetId,
            emergencyCase: c,
            hospitals,
            ambulances,
          }),
        })
        const raw = await res.text()
        let data: TriageAPIResponse | null = null
        if (res.ok) {
          try {
            data = JSON.parse(raw) as TriageAPIResponse
          } catch {
            data = null
          }
        }
        if (!data || !data.source) {
          setAiError(res.ok ? 'Invalid triage response from server.' : `Triage request failed: ${raw.slice(0, 240)}`)
          const fallback = computeLocalTriage(c, hospitals, ambulances)
          applyResult(fallback, 'local')
          addAlert('AI Triage (fallback)', `Case #${targetId} used local heuristic`, 'Medium')
          return
        }
        const { source, ...result } = data
        applyResult(result, source)
        addAlert(
          'AI Triage Completed',
          source === 'gemini'
            ? `Case #${targetId} updated with Gemini (${DEFAULT_GEMINI_MODEL_LABEL})`
            : `Case #${targetId} updated with local triage (set GEMINI_API_KEY for live model)`,
          'High'
        )
      } catch (e) {
        const c = casesRef.current.find((x) => x.id === targetId)
        if (c) {
          const fallback = computeLocalTriage(c, hospitalsRef.current, ambulancesRef.current)
          applyResult(fallback, 'local')
          addAlert('AI Triage (fallback)', `Case #${targetId} used local heuristic after error`, 'Medium')
        }
        setAiError(e instanceof Error ? e.message : 'AI triage failed')
      } finally {
        setAiLoading(false)
      }
    },
    [addAlert]
  )

  const createCase = useCallback((payload: { location: string; caseType: string; estimatedVictims: number; description: string }) => {
    setCases((prev) => {
      const newId = prev.length ? Math.max(...prev.map((c) => c.id)) + 1 : 1001
      const nextCase: EmergencyCase = {
        id: newId,
        type: payload.caseType || 'Emergency',
        location: payload.location || 'Unknown location',
        status: 'Active',
        victims: Math.max(1, payload.estimatedVictims),
        timeAgo: 0,
        severity: { Critical: 1, Burn: 1, Moderate: 2, Minor: 1 },
        suggestedHospitals: { ...roleDefaults },
        timeline: [
          { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: 'Case created by command center operator' },
          { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: payload.description || 'No description provided' },
        ],
      }
      queueMicrotask(() => {
        setActiveCaseId(newId)
        addAlert('New Emergency Case', `Case #${newId} created at ${nextCase.location}`, 'High')
        runAITriage(newId)
      })
      return [nextCase, ...prev]
    })
  }, [runAITriage, addAlert])

  const reassignAmbulance = useCallback((ambulanceId: string, role: SeverityRole, hospital: string) => {
    const assignedHospital = getBestAcceptingHospital(hospital)
    setAmbulances((prev) =>
      prev.map((unit) =>
        unit.id === ambulanceId ? { ...unit, role, assignedHospital, status: 'En Route', etaMin: Math.max(2, unit.etaMin || 4) } : unit
      )
    )
  }, [getBestAcceptingHospital])

  const redirectAmbulances = useCallback(() => {
    const accepting = hospitalsRef.current.filter((h) => h.acceptsIncoming)
    const preferredRelief =
      accepting.length > 0 ? [...accepting].sort((a, b) => a.capacity - b.capacity)[0]!.name : 'Hospital B'
    const targetHospital = getBestAcceptingHospital(preferredRelief)
    setAmbulances((prev) =>
      prev.map((unit) => (unit.role === 'Moderate' ? { ...unit, assignedHospital: targetHospital, etaMin: unit.etaMin + 2 } : unit))
    )
    addAlert('Ambulances Redirected', `Moderate severity units rerouted to ${targetHospital}`, 'High')
  }, [getBestAcceptingHospital, addAlert])

  const requestBloodUnits = useCallback(() => {
    setBloodUnits((prev) => ({ oNegative: prev.oNegative + 20, abNegative: prev.abNegative + 15 }))
    addAlert('Blood Units Requested', 'Emergency replenishment request sent for O- and AB-', 'Critical')
  }, [addAlert])

  const toggleHospitalIntake = useCallback((hospitalName: string) => {
    setHospitals((prev) => {
      const current = prev.find((h) => h.name === hospitalName)
      const nextState = current ? !current.acceptsIncoming : false
      queueMicrotask(() =>
        addAlert(
          'Hospital Intake Updated',
          `${hospitalName} is now ${nextState ? 'accepting incoming cases' : 'diverting incoming cases'}`,
          'Medium'
        )
      )
      return prev.map((hospital) =>
        hospital.name === hospitalName ? { ...hospital, acceptsIncoming: !hospital.acceptsIncoming } : hospital
      )
    })
  }, [addAlert])

  const applyRecommendation = useCallback(() => {
    redirectAmbulances()
    requestBloodUnits()
    addAlert('Recommendation Applied', 'AI recommendation package executed successfully', 'High')
  }, [redirectAmbulances, requestBloodUnits, addAlert])

  useEffect(() => {
    const timer = setInterval(() => {
      setAmbulances((prev) =>
        prev.map((unit) => {
          if (unit.status !== 'En Route') return unit
          const hospital = hospitalsRef.current.find((h) => h.name === unit.assignedHospital)
          if (!hospital) return unit
          const dx = hospital.x - unit.x
          const dy = hospital.y - unit.y
          const nx = Math.abs(dx) < 0.8 ? hospital.x : unit.x + Math.sign(dx) * 0.8
          const ny = Math.abs(dy) < 0.8 ? hospital.y : unit.y + Math.sign(dy) * 0.8
          const reached = Math.abs(dx) < 1 && Math.abs(dy) < 1
          return {
            ...unit,
            x: nx,
            y: ny,
            etaMin: reached ? 0 : Math.max(1, unit.etaMin - 1),
            status: reached ? 'Busy' : unit.status,
          }
        })
      )
      setHospitals((prev) =>
        prev.map((h) => {
          const delta = Math.random() > 0.5 ? 1 : -1
          const capacity = Math.max(20, Math.min(97, h.capacity + delta))
          const status: HospitalUnit['status'] = capacity > 88 ? 'Red' : capacity > 70 ? 'Yellow' : 'Green'
          return { ...h, capacity, status }
        })
      )
      setCases((prev) => prev.map((c) => ({ ...c, timeAgo: c.timeAgo + 1 })))
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const value = useMemo(
    () => ({
      cases,
      ambulances,
      hospitals,
      alerts,
      activeCaseId,
      bloodUnits,
      aiLoading,
      aiError,
      dbLoading,
      dbError,
      createCase,
      setActiveCase: setActiveCaseId,
      runAITriage,
      reassignAmbulance,
      applyRecommendation,
      redirectAmbulances,
      requestBloodUnits,
      toggleHospitalIntake,
    }),
    [
      cases,
      ambulances,
      hospitals,
      alerts,
      activeCaseId,
      bloodUnits,
      aiLoading,
      aiError,
      dbLoading,
      dbError,
      createCase,
      runAITriage,
      reassignAmbulance,
      applyRecommendation,
      redirectAmbulances,
      requestBloodUnits,
      toggleHospitalIntake,
    ]
  )

  return <EmergencyContext.Provider value={value}>{children}</EmergencyContext.Provider>
}

export function useEmergency() {
  const ctx = useContext(EmergencyContext)
  if (!ctx) throw new Error('useEmergency must be used within EmergencyProvider')
  return ctx
}
