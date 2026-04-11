import type { AmbulanceUnit, EmergencyCase, HospitalUnit, SeverityRole } from '@/lib/emergency-types'

/** Shown in the UI; keep in sync with `GEMINI_MODEL` / server default in `lib/ai/gemini-triage.ts`. */
export const DEFAULT_GEMINI_MODEL_LABEL = 'gemini-3-flash-preview'

export interface TriageAIResult {
  severity: Record<SeverityRole, number>
  suggestedHospitals: Record<SeverityRole, string>
  ambulances: Pick<AmbulanceUnit, 'id' | 'role' | 'assignedHospital' | 'etaMin' | 'status'>[]
  timelineNote?: string
}

export interface TriageRequestPayload {
  caseId: number
  emergencyCase: EmergencyCase
  hospitals: HospitalUnit[]
  ambulances: AmbulanceUnit[]
}

export type TriageAPIResponse = TriageAIResult & { source: 'gemini' | 'local' }
