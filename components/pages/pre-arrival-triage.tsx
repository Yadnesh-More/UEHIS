'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Target, MapPin } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useEmergency, type SeverityRole } from '@/lib/emergency-context'

const roles: SeverityRole[] = ['Critical', 'Burn', 'Moderate', 'Minor']
const roleColors: Record<SeverityRole, string> = {
  Critical: 'bg-red-500/10 border-red-500/30',
  Burn: 'bg-orange-500/10 border-orange-500/30',
  Moderate: 'bg-yellow-500/10 border-yellow-500/30',
  Minor: 'bg-emerald-500/10 border-emerald-500/30',
}

export function PreArrivalTriage() {
  const { cases, activeCaseId, ambulances, reassignAmbulance } = useEmergency()
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const activeCase = cases.find((item) => item.id === activeCaseId) ?? cases[0]
  const grouped = useMemo(
    () => roles.reduce((acc, role) => ({ ...acc, [role]: ambulances.filter((a) => a.role === role) }), {} as Record<SeverityRole, typeof ambulances>),
    [ambulances]
  )

  const onDropRole = (role: SeverityRole) => {
    if (!draggedId || !activeCase) return
    const suggested = activeCase.suggestedHospitals[role]
    reassignAmbulance(draggedId, role, suggested)
    setDraggedId(null)
  }

  if (!activeCase) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pre-Arrival Triage</h1>
          <p className="text-muted-foreground">Create a case in Emergency Case Management to load triage data from MongoDB.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pre-Arrival Triage</h1>
        <p className="text-muted-foreground">Case #{activeCase.id} live role assignment and dispatch planning</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Severity Distribution - Case #{activeCase.id}</CardTitle>
          <CardDescription>AI triage output synchronized from emergency workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Critical', value: activeCase.severity.Critical },
                  { name: 'Burn', value: activeCase.severity.Burn },
                  { name: 'Moderate', value: activeCase.severity.Moderate },
                  { name: 'Minor', value: activeCase.severity.Minor },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="hsl(0, 100%, 50%)" />
                <Cell fill="hsl(30, 100%, 50%)" />
                <Cell fill="hsl(45, 100%, 50%)" />
                <Cell fill="hsl(120, 100%, 40%)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {roles.map((role) => (
          <Card
            key={role}
            className={`border-2 border-dashed transition-colors ${roleColors[role]}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => onDropRole(role)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{role} Role</CardTitle>
                <Badge variant="outline">{grouped[role].length} units</Badge>
              </div>
              <CardDescription>Drop ambulance cards here to reassign dynamically</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {grouped[role].map((ambulance) => (
                <div
                  key={ambulance.id}
                  draggable
                  onDragStart={() => setDraggedId(ambulance.id)}
                  className="rounded-md border bg-card p-3 cursor-move hover:border-primary/60 transition-colors"
                >
                  <p className="font-medium text-sm">{ambulance.id}</p>
                  <div className="space-y-1 text-xs text-muted-foreground mt-2">
                    <p className="flex items-center gap-2"><Target className="h-3 w-3" />Role: {ambulance.role}</p>
                    <p className="flex items-center gap-2"><MapPin className="h-3 w-3" />Hospital: {ambulance.assignedHospital}</p>
                    <p className="flex items-center gap-2"><Clock className="h-3 w-3" />ETA: {ambulance.etaMin || '-'} min</p>
                  </div>
                </div>
              ))}
              {grouped[role].length === 0 ? <p className="text-xs text-muted-foreground">No units assigned</p> : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
