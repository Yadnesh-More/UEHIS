import { NextResponse } from 'next/server'
import { getEmergencyState, saveEmergencyState } from '@/lib/db/emergency-state'
import { mongoErrorResponse } from '@/lib/db/mongo-http-error'
import type { EmergencyPersistedState } from '@/lib/emergency-types'

export async function GET() {
  try {
    const state = await getEmergencyState()
    return NextResponse.json(state)
  } catch (e) {
    return mongoErrorResponse(e, 'read')
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as EmergencyPersistedState
    if (
      !body ||
      !Array.isArray(body.cases) ||
      !Array.isArray(body.ambulances) ||
      !Array.isArray(body.hospitals) ||
      !Array.isArray(body.alerts) ||
      typeof body.activeCaseId !== 'number' ||
      !body.bloodUnits ||
      typeof body.bloodUnits.oNegative !== 'number' ||
      typeof body.bloodUnits.abNegative !== 'number'
    ) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    await saveEmergencyState(body)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return mongoErrorResponse(e, 'write')
  }
}
