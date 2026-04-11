import type { AmbulanceUnit, EmergencyCase, HospitalUnit, SeverityRole } from '@/lib/emergency-types'
import { roleDefaults } from '@/lib/emergency-seed'
import type { TriageAIResult } from '@/lib/ai/triage-result'

const ROLES: SeverityRole[] = ['Critical', 'Burn', 'Moderate', 'Minor']

function bestAccepting(hospitals: HospitalUnit[], preferred: string): string {
  if (hospitals.length === 0) return preferred
  const accepting = hospitals.filter((h) => h.acceptsIncoming)
  if (accepting.length === 0) return hospitals[0]!.name
  if (accepting.some((h) => h.name === preferred)) return preferred
  return [...accepting].sort((a, b) => a.capacity - b.capacity)[0]!.name
}

/** Deterministic triage when Gemini is unavailable or returns invalid data. */
export function computeLocalTriage(
  targetCase: EmergencyCase,
  hospitals: HospitalUnit[],
  ambulances: AmbulanceUnit[]
): TriageAIResult {
  const v = Math.max(1, targetCase.victims)
  const severeShift = Math.max(1, Math.round(v * 0.25))
  const moderateShift = Math.max(1, Math.round(v * 0.35))
  const burnShift = Math.max(1, Math.round(v * 0.15))
  const minorShift = Math.max(1, v - severeShift - moderateShift - burnShift)
  const severity: Record<SeverityRole, number> = {
    Critical: severeShift,
    Burn: burnShift,
    Moderate: moderateShift,
    Minor: minorShift,
  }
  const suggestedHospitals: Record<SeverityRole, string> = {
    Critical: bestAccepting(hospitals, roleDefaults.Critical),
    Burn: bestAccepting(hospitals, roleDefaults.Burn),
    Moderate: bestAccepting(hospitals, roleDefaults.Moderate),
    Minor: bestAccepting(hospitals, roleDefaults.Minor),
  }
  const amb: TriageAIResult['ambulances'] = ambulances.map((unit, index) => {
    const role = ROLES[index % ROLES.length]
    return {
      id: unit.id,
      role,
      assignedHospital: bestAccepting(hospitals, suggestedHospitals[role]),
      status: 'En Route' as const,
      etaMin: Math.max(2, (index % 6) + 2),
    }
  })
  return {
    severity,
    suggestedHospitals,
    ambulances: amb,
    timelineNote: 'Local heuristic triage (Gemini unavailable)',
  }
}
