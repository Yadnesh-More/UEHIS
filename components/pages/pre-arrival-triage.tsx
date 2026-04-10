'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Target, MapPin } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { AmbulanceAssignment } from '@/components/ambulance-assignment'

export function PreArrivalTriage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pre-Arrival Triage</h1>
        <p className="text-muted-foreground">Ambulance assignment and role management</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Injury Distribution - Case #1001</CardTitle>
          <CardDescription>Predicted severity breakdown for current emergency</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Critical', value: 3 },
                  { name: 'Burn', value: 2 },
                  { name: 'Moderate', value: 4 },
                  { name: 'Minor', value: 3 },
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

      <div className="grid grid-cols-1 gap-4">
        <AmbulanceAssignment
          type="Critical"
          count={3}
          hospital="Hospital A - Trauma Center"
          color="destructive"
        />
        <AmbulanceAssignment
          type="Burn"
          count={2}
          hospital="Hospital B - Burn Unit"
          color="orange"
        />
        <AmbulanceAssignment
          type="Moderate"
          count={4}
          hospital="Hospital C - General"
          color="yellow"
        />
        <AmbulanceAssignment
          type="Minor"
          count={3}
          hospital="Hospital D - General"
          color="green"
        />
      </div>
    </div>
  )
}
