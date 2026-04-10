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

type PageType = 'dashboard' | 'cases' | 'triage' | 'ambulances' | 'hospitals' | 'blood' | 'insights' | 'reports'

const menuItems = [
  {
    title: 'Command Center',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' as PageType },
      { label: 'Emergency Cases', icon: AlertCircle, page: 'cases' as PageType },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Pre-Arrival Triage', icon: Pill, page: 'triage' as PageType },
      { label: 'Ambulance Management', icon: Ambulance, page: 'ambulances' as PageType },
      { label: 'Hospital Management', icon: Hospital, page: 'hospitals' as PageType },
    ],
  },
  {
    title: 'Resources',
    items: [
      { label: 'Blood Bank', icon: Droplet, page: 'blood' as PageType },
      { label: 'AI Insights', icon: Brain, page: 'insights' as PageType },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { label: 'Reports', icon: BarChart3, page: 'reports' as PageType },
    ],
  },
]

interface AppSidebarProps {
  currentPage: PageType
  setCurrentPage: (page: PageType) => void
}

export function AppSidebar({ currentPage, setCurrentPage }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.page}>
                    <SidebarMenuButton
                      asChild
                      isActive={currentPage === item.page}
                      onClick={() => setCurrentPage(item.page)}
                      className="cursor-pointer"
                    >
                      <button className="flex items-center gap-2 w-full">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
