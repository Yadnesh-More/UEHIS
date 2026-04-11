export type AuthRole = 'hospital' | 'blood_bank' | 'civilian'

export type AppPageType =
  | 'dashboard'
  | 'cases'
  | 'triage'
  | 'ambulances'
  | 'hospitals'
  | 'blood'
  | 'insights'
  | 'reports'

export interface AuthSession {
  role: AuthRole
  email: string
  /** Facility name for hospital / blood bank; optional for civilian */
  organizationName: string | null
}

export const AUTH_SESSION_STORAGE_KEY = 'uehis_auth_session_v1'

/** Which app sections each role can open (demonstration app). */
export const ROLE_VISIBLE_PAGES: Record<AuthRole, AppPageType[]> = {
  hospital: [
    'dashboard',
    'cases',
    'triage',
    'ambulances',
    'hospitals',
    'blood',
    'insights',
    'reports',
  ],
  blood_bank: ['dashboard', 'cases', 'blood', 'insights', 'reports'],
  civilian: ['dashboard', 'reports'],
}

export const ROLE_LABELS: Record<AuthRole, string> = {
  hospital: 'Hospital',
  blood_bank: 'Blood bank',
  civilian: 'Civilian',
}
