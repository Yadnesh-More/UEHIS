import { NextResponse } from 'next/server'
import { z } from 'zod'
import { runGeminiTriage } from '@/lib/ai/gemini-triage'
import type { TriageRequestPayload } from '@/lib/ai/triage-result'

const hospitalSchema = z.object({
  name: z.string(),
  status: z.enum(['Green', 'Yellow', 'Red']),
  acceptsIncoming: z.boolean(),
  icu: z.number(),
  general: z.number(),
  doctors: z.number(),
  specializations: z.array(z.string()),
  capacity: z.number(),
  x: z.number(),
  y: z.number(),
})

const ambulanceSchema = z.object({
  id: z.string(),
  role: z.enum(['Critical', 'Burn', 'Moderate', 'Minor']),
  status: z.enum(['En Route', 'Available', 'Busy']),
  assignedHospital: z.string(),
  etaMin: z.number(),
  x: z.number(),
  y: z.number(),
})

const emergencyCaseSchema = z.object({
  id: z.number(),
  type: z.string(),
  location: z.string(),
  status: z.enum(['Active', 'In Progress']),
  victims: z.number(),
  timeAgo: z.number(),
  severity: z.object({
    Critical: z.number(),
    Burn: z.number(),
    Moderate: z.number(),
    Minor: z.number(),
  }),
  timeline: z.array(z.object({ time: z.string(), event: z.string() })),
  suggestedHospitals: z.object({
    Critical: z.string(),
    Burn: z.string(),
    Moderate: z.string(),
    Minor: z.string(),
  }),
})

const bodySchema = z
  .object({
    caseId: z.number(),
    emergencyCase: emergencyCaseSchema,
    hospitals: z.array(hospitalSchema),
    ambulances: z.array(ambulanceSchema),
  })
  .refine((b) => b.hospitals.length > 0 && b.ambulances.length > 0, {
    message: 'hospitals and ambulances must be non-empty',
  })

export async function POST(request: Request) {
  try {
    const json = (await request.json()) as unknown
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 })
    }
    const { caseId, emergencyCase, hospitals, ambulances } = parsed.data
    if (emergencyCase.id !== caseId) {
      return NextResponse.json({ error: 'caseId must match emergencyCase.id' }, { status: 400 })
    }
    const payload: TriageRequestPayload = { caseId, emergencyCase, hospitals, ambulances }
    const { source, ...result } = await runGeminiTriage(payload)
    return NextResponse.json({ ...result, source })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Triage failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
