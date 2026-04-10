'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useEmergency } from '@/lib/emergency-context'

export function ExecutionTrackingPanel() {
  const { ambulances, hospitals } = useEmergency()
  const transported = ambulances.filter((a) => a.status === 'Busy').length
  const active = ambulances.filter((a) => a.status !== 'Available').length
  const avgCapacity = Math.round(hospitals.reduce((acc, h) => acc + h.capacity, 0) / hospitals.length)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Tracking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Patients Transported</span>
            <span>{Math.round((transported / ambulances.length) * 100)}%</span>
          </div>
          <Progress value={(transported / ambulances.length) * 100} />
        </div>
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Ambulances Active</span>
            <span>{Math.round((active / ambulances.length) * 100)}%</span>
          </div>
          <Progress value={(active / ambulances.length) * 100} />
        </div>
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Hospital Capacity Used</span>
            <span>{avgCapacity}%</span>
          </div>
          <Progress value={avgCapacity} />
        </div>
      </CardContent>
    </Card>
  )
}
