'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, AlertTriangle, Ambulance, Heart, Zap } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { LiveMap } from '@/components/live-map'

export function Dashboard() {
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
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 critical, 5 moderate, 4 mild</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ambulances En Route</CardTitle>
            <Ambulance className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">2 critical, 4 moderate, 2 minor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hospital Capacity</CardTitle>
            <Heart className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">28 beds available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Staff</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">43</div>
            <p className="text-xs text-muted-foreground">12 doctors, 31 nurses</p>
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
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
              <div className="flex gap-2">
                <div className="h-2 w-2 rounded-full bg-destructive mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-destructive">O- Blood Low</p>
                  <p className="text-xs text-muted-foreground">Only 3 units remaining</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-3">
              <div className="flex gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500 mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-600 dark:text-yellow-400">Hospital A Capacity</p>
                  <p className="text-xs text-muted-foreground">85% bed occupancy</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-3">
              <div className="flex gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500 mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-600 dark:text-yellow-400">Ambulance ETA +5min</p>
                  <p className="text-xs text-muted-foreground">Unit AM-03 delayed</p>
                </div>
              </div>
            </div>
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
                    { name: 'Critical', value: 3 },
                    { name: 'Moderate', value: 5 },
                    { name: 'Mild', value: 4 },
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
                  { name: 'Hospital A', capacity: 68, limit: 100 },
                  { name: 'Hospital B', capacity: 42, limit: 100 },
                  { name: 'Hospital C', capacity: 78, limit: 100 },
                  { name: 'Hospital D', capacity: 35, limit: 100 },
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
    </div>
  )
}
