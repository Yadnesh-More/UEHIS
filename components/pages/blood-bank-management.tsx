'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { useEmergency } from '@/lib/emergency-context'

export function BloodBankManagement() {
  const { bloodUnits } = useEmergency()
  const bloodTypes = [
    { type: 'O+', units: 15, capacity: 50, status: 'Good' },
    { type: 'O-', units: bloodUnits.oNegative, capacity: 50, status: bloodUnits.oNegative < 7 ? 'Critical' : 'Low' },
    { type: 'A+', units: 22, capacity: 50, status: 'Good' },
    { type: 'A-', units: 8, capacity: 50, status: 'Low' },
    { type: 'B+', units: 18, capacity: 50, status: 'Good' },
    { type: 'B-', units: 5, capacity: 50, status: 'Low' },
    { type: 'AB+', units: 12, capacity: 50, status: 'Good' },
    { type: 'AB-', units: bloodUnits.abNegative, capacity: 50, status: bloodUnits.abNegative < 7 ? 'Critical' : 'Low' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
      case 'Low':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
      default:
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'Critical':
        return 'bg-red-500'
      case 'Low':
        return 'bg-yellow-500'
      default:
        return 'bg-emerald-500'
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Blood Bank Management</h1>
        <p className="text-muted-foreground">Blood inventory tracking and distribution</p>
      </div>

      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-destructive">Low Stock Alert</p>
          <p className="text-sm text-muted-foreground">O- and AB- blood types critically low. Immediate transfusion requests recommended.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {bloodTypes.map((blood) => (
          <Card key={blood.type}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{blood.type}</CardTitle>
                <Badge variant="outline" className={getStatusColor(blood.status)}>
                  {blood.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Units Available</p>
                  <p className="font-bold text-lg">{blood.units}</p>
                </div>
                <Progress value={(blood.units / blood.capacity) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{blood.units} of {blood.capacity} units</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Blood Usage Trends</CardTitle>
            <CardDescription>Last 7 days consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={[
                  { day: 'Mon', units: 12 },
                  { day: 'Tue', units: 19 },
                  { day: 'Wed', units: 15 },
                  { day: 'Thu', units: 25 },
                  { day: 'Fri', units: 18 },
                  { day: 'Sat', units: 22 },
                  { day: 'Sun', units: 16 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="units" stroke="hsl(0, 100%, 50%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transfer Requests</CardTitle>
            <CardDescription>Pending blood transfers between banks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">O- Units</p>
                  <p className="text-xs text-muted-foreground">From Central Bank to Hospital A</p>
                </div>
                <Badge>5 units</Badge>
              </div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">A+ Units</p>
                  <p className="text-xs text-muted-foreground">From Hospital B to Hospital C</p>
                </div>
                <Badge>3 units</Badge>
              </div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">AB- Units</p>
                  <p className="text-xs text-muted-foreground">From Central Bank to Hospital D</p>
                </div>
                <Badge>2 units</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
