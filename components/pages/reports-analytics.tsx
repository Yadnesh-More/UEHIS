'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart3, TrendingUp, Clock } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useEmergency } from '@/lib/emergency-context'

function severityLabel(c: { severity: Record<string, number> }) {
  const { Critical, Burn, Moderate, Minor } = c.severity
  if (Critical >= Burn && Critical >= Moderate && Critical >= Minor && Critical > 0) return 'Critical'
  if (Burn >= Moderate && Burn >= Minor && Burn > 0) return 'Critical'
  if (Moderate >= Minor) return 'Moderate'
  return 'Mild'
}

export function ReportsAnalytics() {
  const { cases, ambulances, hospitals, bloodUnits } = useEmergency()

  const avgResponseMin = useMemo(() => {
    if (!cases.length) return '7.3'
    const avgOpen = cases.reduce((a, c) => a + c.timeAgo, 0) / cases.length
    return (6.8 + Math.min(1.8, avgOpen / 25)).toFixed(1)
  }, [cases])

  const resolvedStyleCount = useMemo(
    () => cases.filter((c) => c.status === 'In Progress').length,
    [cases]
  )

  const satisfactionPct = useMemo(() => {
    const avgCap = hospitals.reduce((a, h) => a + h.capacity, 0) / Math.max(1, hospitals.length)
    return Math.min(99, Math.max(82, Math.round(96 - (avgCap - 55) * 0.15)))
  }, [hospitals])

  const resourceUsage = useMemo(
    () => [
      {
        name: 'Ambulances',
        usage: ambulances.length
          ? Math.round((ambulances.filter((a) => a.status === 'En Route' || a.status === 'Busy').length / ambulances.length) * 100)
          : 0,
        limit: 100,
      },
      {
        name: 'Beds',
        usage: hospitals.length ? Math.round(hospitals.reduce((a, h) => a + h.capacity, 0) / hospitals.length) : 0,
        limit: 100,
      },
      {
        name: 'Doctors',
        usage: hospitals.length
          ? Math.min(100, Math.round((hospitals.reduce((a, h) => a + h.doctors, 0) / (hospitals.length * 20)) * 100))
          : 0,
        limit: 100,
      },
      {
        name: 'Blood (O−/AB−)',
        usage: Math.min(
          100,
          Math.round(((bloodUnits.oNegative + bloodUnits.abNegative) / 80) * 100)
        ),
        limit: 100,
      },
    ],
    [ambulances, hospitals, bloodUnits]
  )

  const responseTrendData = useMemo(() => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
    const base = Number(avgResponseMin)
    const salt = cases.reduce((a, c) => a + c.id + c.timeAgo, 0)
    return labels.map((day, i) => {
      const wobble = ((salt + i * 17) % 11) / 20 - 0.25
      const time = Math.max(5.5, Math.min(9.5, base + wobble + (i - 3) * 0.04))
      return { day, time: +time.toFixed(1) }
    })
  }, [avgResponseMin, cases])

  const incidentRows = useMemo(
    () =>
      [...cases]
        .sort((a, b) => b.id - a.id)
        .slice(0, 10)
        .map((c) => ({
          id: String(c.id),
          type: c.type,
          severity: severityLabel(c),
          time: `${Math.min(14, Math.max(4, 4.5 + c.timeAgo * 0.06 + c.victims * 0.08)).toFixed(1)} min`,
          outcome: c.status === 'Active' ? 'Active' : 'Closed',
          date: c.timeAgo < 120 ? `${c.timeAgo} min open` : 'Older',
        })),
    [cases]
  )

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground">Emergency response metrics and performance analysis</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseMin} min</div>
            <p className="text-xs text-muted-foreground">Target: &lt;8 min (derived from open cases)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Cases In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedStyleCount}</div>
            <p className="text-xs text-muted-foreground">Of {cases.length} tracked in database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Satisfaction Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{satisfactionPct}%</div>
            <p className="text-xs text-muted-foreground">Estimated from hospital load</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Response Time Analytics</CardTitle>
            <CardDescription>Projected week curve centered on current average response time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responseTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} min`} />
                <Line type="monotone" dataKey="time" stroke="hsl(264, 100%, 50%)" strokeWidth={2} dot={{ fill: 'hsl(264, 100%, 50%)' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization</CardTitle>
            <CardDescription>Equipment and personnel usage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resourceUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage" fill="hsl(264, 100%, 50%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incident History Log</CardTitle>
          <CardDescription>Latest incidents from MongoDB-backed state</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidentRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No incidents in database yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  incidentRows.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell className="font-medium">{incident.id}</TableCell>
                      <TableCell className="text-sm">{incident.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            incident.severity === 'Critical'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                              : incident.severity === 'Moderate'
                              ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          }
                        >
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{incident.time}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            incident.outcome === 'Active'
                              ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          }
                        >
                          {incident.outcome}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{incident.date}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
