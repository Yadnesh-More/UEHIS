import { NextResponse } from 'next/server'

function isQuerySrvEnotFound(e: unknown): boolean {
  const err = e as NodeJS.ErrnoException & { syscall?: string }
  return err?.code === 'ENOTFOUND' && String(err?.syscall ?? '') === 'querySrv'
}

/** Maps driver/network errors to HTTP responses with safe, actionable hints. */
export function mongoErrorResponse(e: unknown, operation: 'read' | 'write') {
  if (isQuerySrvEnotFound(e)) {
    return NextResponse.json(
      {
        error: operation === 'read' ? 'Failed to load emergency state' : 'Failed to save emergency state',
        code: 'ENOTFOUND',
        hint:
          'MongoDB SRV DNS lookup failed. Fix: (1) Confirm you are online and not blocking DNS (try another network or turn off VPN). (2) In Atlas: Connect → Drivers → choose "Standard connection string" and set MONGODB_URI to that mongodb://… URI (not mongodb+srv). (3) On Windows, try DNS 1.1.1.1 or 8.8.8.8 for your adapter.',
      },
      { status: 503 }
    )
  }

  const msg = e instanceof Error ? e.message : String(e)
  console.error(`[mongo ${operation}]`, e)
  return NextResponse.json(
    {
      error: operation === 'read' ? 'Failed to load emergency state' : 'Failed to save emergency state',
      detail: process.env.NODE_ENV === 'development' ? msg : undefined,
    },
    { status: 500 }
  )
}
