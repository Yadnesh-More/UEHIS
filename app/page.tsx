'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainNav } from '@/components/main-nav'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Dashboard } from '@/components/pages/dashboard'
import { EmergencyCaseManagement } from '@/components/pages/emergency-case-management'
import { PreArrivalTriage } from '@/components/pages/pre-arrival-triage'
import { AmbulanceManagement } from '@/components/pages/ambulance-management'
import { HospitalManagement } from '@/components/pages/hospital-management'
import { BloodBankManagement } from '@/components/pages/blood-bank-management'
import { AIInsights } from '@/components/pages/ai-insights'
import { ReportsAnalytics } from '@/components/pages/reports-analytics'
import { EmergencyProvider, useEmergency } from '@/lib/emergency-context'
import { useAuth } from '@/lib/auth-context'
import type { AppPageType } from '@/lib/auth-types'
import { ROLE_VISIBLE_PAGES } from '@/lib/auth-types'
import { Spinner } from '@/components/ui/spinner'

function EmergencyApp() {
  const { session } = useAuth()
  const { dbLoading, dbError, aiError } = useEmergency()
  const [currentPage, setCurrentPage] = useState<AppPageType>('dashboard')

  useEffect(() => {
    if (!session) return
    const pages = ROLE_VISIBLE_PAGES[session.role]
    if (!pages.includes(currentPage)) {
      setCurrentPage(pages[0] ?? 'dashboard')
    }
  }, [session, currentPage])

  if (!session) return null

  const allowedPages = ROLE_VISIBLE_PAGES[session.role]

  if (dbLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
        <Spinner className="size-8 text-primary" />
        <p className="text-sm">Connecting to command center database…</p>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'cases':
        return <EmergencyCaseManagement />
      case 'triage':
        return <PreArrivalTriage />
      case 'ambulances':
        return <AmbulanceManagement />
      case 'hospitals':
        return <HospitalManagement />
      case 'blood':
        return <BloodBankManagement />
      case 'insights':
        return <AIInsights />
      case 'reports':
        return <ReportsAnalytics />
      default:
        return <Dashboard />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          allowedPages={allowedPages}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <MainNav />
          {dbError ? (
            <div className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-900 dark:text-amber-100">
              {dbError}
            </div>
          ) : null}
          {aiError ? (
            <div className="border-b border-orange-500/40 bg-orange-500/10 px-4 py-2 text-center text-sm text-orange-950 dark:text-orange-100">
              {aiError}
            </div>
          ) : null}
          <main className="flex-1 overflow-auto bg-background transition-all duration-300">
            <div className="animate-in fade-in-50 duration-300">{renderPage()}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

function HomeGate() {
  const { session, hydrated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!hydrated) return
    if (!session) router.replace('/auth')
  }, [hydrated, session, router])

  if (!hydrated || !session) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
        <Spinner className="size-8 text-primary" />
        <p className="text-sm">
          {hydrated ? 'Redirecting to sign in…' : 'Loading…'}
        </p>
      </div>
    )
  }

  return (
    <EmergencyProvider>
      <EmergencyApp />
    </EmergencyProvider>
  )
}

export default function Home() {
  return <HomeGate />
}
