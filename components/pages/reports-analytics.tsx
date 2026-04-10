'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart3, TrendingUp, Clock } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function ReportsAnalytics() {
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
            <div className="text-2xl font-bold">7.3 min</div>
            <p className="text-xs text-muted-foreground">Target: &lt;8 min</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Cases Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">This month</p>
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
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Patient feedback</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Response Time Analytics</CardTitle>
            <CardDescription>Daily average response times</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={[
                  { day: 'Mon', time: 7.2 },
                  { day: 'Tue', time: 7.8 },
                  { day: 'Wed', time: 6.9 },
                  { day: 'Thu', time: 7.5 },
                  { day: 'Fri', time: 7.1 },
                  { day: 'Sat', time: 7.6 },
                  { day: 'Sun', time: 7.3 },
                ]}
              >
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
              <BarChart
                data={[
                  { name: 'Ambulances', usage: 67, limit: 100 },
                  { name: 'Beds', usage: 72, limit: 100 },
                  { name: 'Doctors', usage: 58, limit: 100 },
                  { name: 'Nurses', usage: 65, limit: 100 },
                  { name: 'Blood Units', usage: 54, limit: 100 },
                ]}
              >
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
          <CardDescription>Last 10 emergency responses</CardDescription>
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
                {[
                  { id: '1001', type: 'Multi-vehicle accident', severity: 'Critical', time: '6.2 min', outcome: 'Resolved', date: 'Today 2:45 PM' },
                  { id: '1000', type: 'House fire', severity: 'Critical', time: '7.8 min', outcome: 'Resolved', date: 'Today 1:12 PM' },
                  { id: '999', type: 'Fall injury', severity: 'Moderate', time: '5.4 min', outcome: 'Resolved', date: 'Today 10:30 AM' },
                  { id: '998', type: 'Chest pain', severity: 'Moderate', time: '8.1 min', outcome: 'Resolved', date: 'Yesterday 8:45 PM' },
                  { id: '997', type: 'Allergic reaction', severity: 'Mild', time: '4.9 min', outcome: 'Resolved', date: 'Yesterday 3:20 PM' },
                  { id: '996', type: 'Traffic accident', severity: 'Critical', time: '6.5 min', outcome: 'Resolved', date: '2 days ago' },
                  { id: '995', type: 'Stroke alert', severity: 'Critical', time: '7.2 min', outcome: 'Resolved', date: '2 days ago' },
                  { id: '994', type: 'Drowning', severity: 'Critical', time: '5.8 min', outcome: 'Resolved', date: '3 days ago' },
                  { id: '993', type: 'Seizure', severity: 'Moderate', time: '6.9 min', outcome: 'Resolved', date: '3 days ago' },
                  { id: '992', type: 'Laceration', severity: 'Mild', time: '7.5 min', outcome: 'Resolved', date: '4 days ago' },
                ].map((incident) => (
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
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                        {incident.outcome}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{incident.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
