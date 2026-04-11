import { GoogleGenerativeAI } from '@google/generative-ai'
import type { HospitalUnit, SeverityRole } from '@/lib/emergency-types'
import { computeLocalTriage } from '@/lib/ai/local-triage'
import type { TriageAIResult, TriageAPIResponse, TriageRequestPayload } from '@/lib/ai/triage-result'

export const GEMINI_TRIAGE_MODEL = process.env.GEMINI_MODEL ?? 'gemini-3-flash-preview'

const ROLES: SeverityRole[] = ['Critical', 'Burn', 'Moderate', 'Minor']

function resolveHospitalName(input: string, hospitals: HospitalUnit[]): string {
  if (hospitals.length === 0) return 'Unassigned'
  const t = input.trim()
  const exact = hospitals.find((h) => h.name === t)
  if (exact) return exact.name
  const tl = t.toLowerCase()
  const partial = hospitals.find(
    (h) => h.name.toLowerCase() === tl || h.name.toLowerCase().includes(tl) || tl.includes(h.name.toLowerCase())
  )
  if (partial) return partial.name
  const accepting = [...hospitals].filter((h) => h.acceptsIncoming).sort((a, b) => a.capacity - b.capacity)
  return accepting[0]?.name ?? hospitals[0]!.name
}

function normalizeSeverity(victims: number, raw: Record<string, unknown>): Record<SeverityRole, number> {
  const v = Math.max(1, victims)
  const parts = ROLES.map((r) => {
    const n = raw[r]
    return typeof n === 'number' && !Number.isNaN(n) ? Math.max(0, Math.floor(n)) : 0
  })
  let sum = parts.reduce((a, b) => a + b, 0)
  if (sum === 0) {
    const base = Math.max(1, Math.floor(v / 4))
    for (let i = 0; i < 4; i++) parts[i] = base
    sum = parts.reduce((a, b) => a + b, 0)
    parts[3] = Math.max(1, parts[3]! + (v - sum))
    sum = parts.reduce((a, b) => a + b, 0)
  }
  if (sum !== v) {
    const diff = v - sum
    const idx = parts.indexOf(Math.max(...parts))
    parts[idx] = Math.max(0, parts[idx]! + diff)
  }
  return {
    Critical: parts[0]!,
    Burn: parts[1]!,
    Moderate: parts[2]!,
    Minor: parts[3]!,
  }
}

function parseJsonFromModel(text: string): unknown {
  const trimmed = text.trim()
  const unfenced = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  return JSON.parse(unfenced) as unknown
}

function withSource(result: TriageAIResult, source: TriageAPIResponse['source']): TriageAPIResponse {
  return { ...result, source }
}

export async function runGeminiTriage(payload: TriageRequestPayload): Promise<TriageAPIResponse> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) {
    return withSource(computeLocalTriage(payload.emergencyCase, payload.hospitals, payload.ambulances), 'local')
  }

  const { emergencyCase: c, hospitals, ambulances } = payload
  const hospitalNames = hospitals.map((h) => h.name).join(', ')
  const ambulanceIds = ambulances.map((a) => a.id).join(', ')

  const prompt = `You are an emergency medical dispatch AI for a unified command center.

Emergency case (JSON):
${JSON.stringify({
  id: c.id,
  type: c.type,
  location: c.location,
  status: c.status,
  victims: c.victims,
  descriptionFromTimeline: c.timeline.slice(-2),
})}

Hospitals (name, capacityPercent, acceptsIncoming, specializations):
${JSON.stringify(
  hospitals.map((h) => ({
    name: h.name,
    capacity: h.capacity,
    acceptsIncoming: h.acceptsIncoming,
    specializations: h.specializations,
  }))
)}

Ambulance unit ids (assign each exactly once): [${ambulanceIds}]

Rules:
- Integer severity counts Critical, Burn, Moderate, Minor must sum to exactly ${c.victims} victims.
- suggestedHospitals maps each role to exactly one hospital name from this list: ${hospitalNames}
- Prefer hospitals with lower capacity% when acceptingIncoming is true; respect acceptsIncoming=false (do not assign new inbound flow there unless no alternative).
- ambulanceAssignments: one object per id in [${ambulanceIds}], with role, assignedHospital (must be from the list), etaMin (2-20 integer), status one of En Route|Available|Busy (use En Route for units actively dispatched).

Respond with ONLY valid JSON (no markdown) in this shape:
{
  "severity": { "Critical": 0, "Burn": 0, "Moderate": 0, "Minor": 0 },
  "suggestedHospitals": { "Critical": "", "Burn": "", "Moderate": "", "Minor": "" },
  "ambulanceAssignments": [ { "id": "", "role": "Critical", "assignedHospital": "", "etaMin": 4, "status": "En Route" } ],
  "timelineNote": "one short sentence for the operator log"
}`

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: GEMINI_TRIAGE_MODEL,
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    })
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const parsed = parseJsonFromModel(text) as Record<string, unknown>
    const sevRaw = (parsed.severity as Record<string, unknown>) ?? {}
    const severity = normalizeSeverity(c.victims, sevRaw)
    const sug = (parsed.suggestedHospitals as Record<string, unknown>) ?? {}
    const suggestedHospitals: Record<SeverityRole, string> = {
      Critical: resolveHospitalName(String(sug.Critical ?? ''), hospitals),
      Burn: resolveHospitalName(String(sug.Burn ?? ''), hospitals),
      Moderate: resolveHospitalName(String(sug.Moderate ?? ''), hospitals),
      Minor: resolveHospitalName(String(sug.Minor ?? ''), hospitals),
    }
    const rawAssign = Array.isArray(parsed.ambulanceAssignments) ? parsed.ambulanceAssignments : []
    const byId = new Map<string, Record<string, unknown>>()
    for (const row of rawAssign) {
      if (row && typeof row === 'object' && typeof (row as { id?: string }).id === 'string') {
        byId.set((row as { id: string }).id, row as Record<string, unknown>)
      }
    }
    const statusOk = (s: string): s is 'En Route' | 'Available' | 'Busy' =>
      s === 'En Route' || s === 'Available' || s === 'Busy'
    const ambulancesOut: TriageAIResult['ambulances'] = ambulances.map((unit, index) => {
      const row = byId.get(unit.id)
      let role: SeverityRole = ROLES[index % ROLES.length]
      if (row && typeof row.role === 'string' && ROLES.includes(row.role as SeverityRole)) {
        role = row.role as SeverityRole
      }
      let assignedHospital = resolveHospitalName(typeof row?.assignedHospital === 'string' ? row.assignedHospital : '', hospitals)
      assignedHospital = resolveHospitalName(assignedHospital, hospitals)
      let etaMin = typeof row?.etaMin === 'number' ? Math.min(30, Math.max(2, Math.round(row.etaMin))) : Math.max(2, (index % 6) + 2)
      let status: 'En Route' | 'Available' | 'Busy' = 'En Route'
      if (row && typeof row.status === 'string' && statusOk(row.status)) status = row.status
      return { id: unit.id, role, assignedHospital, etaMin, status }
    })
    const timelineNote = typeof parsed.timelineNote === 'string' ? parsed.timelineNote.slice(0, 220) : undefined
    return withSource(
      {
        severity,
        suggestedHospitals,
        ambulances: ambulancesOut,
        timelineNote,
      },
      'gemini'
    )
  } catch {
    return withSource(computeLocalTriage(c, hospitals, ambulances), 'local')
  }
}
