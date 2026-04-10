'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, AlertTriangle, Ambulance, Heart, Zap } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { LiveMap } from '@/components/live-map'
import { useEmergency } from '@/lib/emergency-context'
import { ExecutionTrackingPanel } from '@/components/execution-tracking-panel'

export function Dashboard() {
  const { cases, activeCaseId, ambulances, hospitals, alerts } = useEmergency()
  const activeCase = cases.find((item) => item.id === activeCaseId) ?? cases[0]
  const avgCapacity = Math.round(hospitals.reduce((acc, h) => acc + h.capacity, 0) / hospitals.length)

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Emergency Command Center</h1>
        <p className="text-muted-foreground">Real-time emergency response management and coordination</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cases.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeCase.severity.Critical} critical, {activeCase.severity.Moderate} moderate, {activeCase.severity.Minor} minor
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ambulances En Route</CardTitle>
            <Ambulance className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ambulances.filter((a) => a.status === 'En Route').length}</div>
            <p className="text-xs text-muted-foreground">live dispatch tracking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hospital Capacity</CardTitle>
            <Heart className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCapacity}%</div>
            <p className="text-xs text-muted-foreground">real-time utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Staff</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hospitals.reduce((acc, h) => acc + h.doctors, 0)}</div>
            <p className="text-xs text-muted-foreground">doctors across all hospitals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Zap className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Operational
            </div>
            <p className="text-xs text-muted-foreground">All systems online</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Live Map Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Live Map & Locations</CardTitle>
            <CardDescription>Ambulance positions and emergency sites</CardDescription>
          </CardHeader>
          <CardContent>
            <LiveMap />
          </CardContent>
        </Card>

        {/* Alerts Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
            <CardDescription>Critical notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-lg border p-3 ${
                  alert.priority === 'Critical'
                    ? 'border-destructive/60 bg-destructive/5 animate-pulse'
                    : alert.priority === 'High'
                    ? 'border-yellow-500/50 bg-yellow-500/5'
                    : 'border-blue-500/40 bg-blue-500/5'
                }`}
              >
                <div className="flex gap-2">
                  <div
                    className={`h-2 w-2 rounded-full mt-1 flex-shrink-0 ${
                      alert.priority === 'Critical'
                        ? 'bg-destructive'
                        : alert.priority === 'High'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <div className="text-sm">
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient Distribution by Severity</CardTitle>
            <CardDescription>Current case breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Critical', value: activeCase.severity.Critical },
                    { name: 'Moderate', value: activeCase.severity.Moderate },
                    { name: 'Mild', value: activeCase.severity.Minor },
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
                  <Cell fill="hsl(45, 100%, 50%)" />
                  <Cell fill="hsl(120, 100%, 40%)" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization</CardTitle>
            <CardDescription>Current capacity across hospitals</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  ...hospitals.map((hospital) => ({ name: hospital.name, capacity: hospital.capacity, limit: 100 })),
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="capacity" fill="hsl(264, 100%, 50%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <ExecutionTrackingPanel />
    </div>
  )
}
