'use client'

import { useState } from 'react'
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
import { EmergencyProvider } from '@/lib/emergency-context'

type PageType = 'dashboard' | 'cases' | 'triage' | 'ambulances' | 'hospitals' | 'blood' | 'insights' | 'reports'

function EmergencyApp() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')

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
        <AppSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <MainNav />
          <main className="flex-1 overflow-auto bg-background transition-all duration-300">
            <div className="animate-in fade-in-50 duration-300">{renderPage()}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default function Home() {
  return (
    <EmergencyProvider>
      <EmergencyApp />
    </EmergencyProvider>
  )
}
