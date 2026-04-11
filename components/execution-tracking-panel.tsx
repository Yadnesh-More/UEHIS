'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useEmergency } from '@/lib/emergency-context'

export function ExecutionTrackingPanel() {
  const { ambulances, hospitals } = useEmergency()
  const transported = ambulances.filter((a) => a.status === 'Busy').length
  const active = ambulances.filter((a) => a.status !== 'Available').length
  const avgCapacity =
    hospitals.length > 0 ? Math.round(hospitals.reduce((acc, h) => acc + h.capacity, 0) / hospitals.length) : 0
  const ambTotal = ambulances.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Tracking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Patients Transported</span>
            <span>{ambTotal ? Math.round((transported / ambTotal) * 100) : 0}%</span>
          </div>
          <Progress value={ambTotal ? (transported / ambTotal) * 100 : 0} />
        </div>
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Ambulances Active</span>
            <span>{ambTotal ? Math.round((active / ambTotal) * 100) : 0}%</span>
          </div>
          <Progress value={ambTotal ? (active / ambTotal) * 100 : 0} />
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
