'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  AlertCircle,
  Pill,
  Ambulance,
  Hospital,
  Droplet,
  Brain,
  BarChart3,
} from 'lucide-react'
import type { AppPageType } from '@/lib/auth-types'

const menuItems: {
  title: string
  items: { label: string; icon: typeof LayoutDashboard; page: AppPageType }[]
}[] = [
  {
    title: 'Command Center',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
      { label: 'Emergency Cases', icon: AlertCircle, page: 'cases' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Pre-Arrival Triage', icon: Pill, page: 'triage' },
      { label: 'Ambulance Management', icon: Ambulance, page: 'ambulances' },
      { label: 'Hospital Management', icon: Hospital, page: 'hospitals' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { label: 'Blood Bank', icon: Droplet, page: 'blood' },
      { label: 'AI Insights', icon: Brain, page: 'insights' },
    ],
  },
  {
    title: 'Analytics',
    items: [{ label: 'Reports', icon: BarChart3, page: 'reports' }],
  },
]

interface AppSidebarProps {
  currentPage: AppPageType
  setCurrentPage: (page: AppPageType) => void
  allowedPages: AppPageType[]
}

export function AppSidebar({
  currentPage,
  setCurrentPage,
  allowedPages,
}: AppSidebarProps) {
  const allowed = new Set(allowedPages)

  return (
    <Sidebar>
      <SidebarContent>
        {menuItems.map((group) => {
          const visible = group.items.filter((item) => allowed.has(item.page))
          if (visible.length === 0) return null
          return (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visible.map((item) => (
                    <SidebarMenuItem key={item.page}>
                      <SidebarMenuButton
                        asChild
                        isActive={currentPage === item.page}
                        onClick={() => setCurrentPage(item.page)}
                        className="cursor-pointer"
                      >
                        <button type="button" className="flex w-full items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
    </Sidebar>
  )
}
