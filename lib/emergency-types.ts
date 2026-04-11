export type SeverityRole = 'Critical' | 'Burn' | 'Moderate' | 'Minor'
export type AlertPriority = 'Critical' | 'High' | 'Medium'

export interface EmergencyCase {
  id: number
  type: string
  location: string
  status: 'Active' | 'In Progress'
  victims: number
  timeAgo: number
  severity: Record<SeverityRole, number>
  timeline: { time: string; event: string }[]
  suggestedHospitals: Record<SeverityRole, string>
}

export interface AmbulanceUnit {
  id: string
  role: SeverityRole
  status: 'En Route' | 'Available' | 'Busy'
  assignedHospital: string
  etaMin: number
  x: number
  y: number
}

export interface HospitalUnit {
  name: string
  status: 'Green' | 'Yellow' | 'Red'
  acceptsIncoming: boolean
  icu: number
  general: number
  doctors: number
  specializations: string[]
  capacity: number
  x: number
  y: number
}

export interface SystemAlert {
  id: string
  title: string
  detail: string
  priority: AlertPriority
  createdAt: number
}

export interface EmergencyPersistedState {
  cases: EmergencyCase[]
  ambulances: AmbulanceUnit[]
  hospitals: HospitalUnit[]
  alerts: SystemAlert[]
  activeCaseId: number
  bloodUnits: { oNegative: number; abNegative: number }
}
