'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Target, MapPin, Clock, RotateCcw } from 'lucide-react'

interface AmbulanceAssignmentProps {
  type: 'Critical' | 'Burn' | 'Moderate' | 'Minor'
  count: number
  hospital: string
  color: string
}

interface Ambulance {
  id: string
  role: string
  hospital: string
  eta: number
  originalType: string
}

const initialAmbulances: Record<string, Ambulance[]> = {
  Critical: [
    { id: 'AM-01', role: 'Critical', hospital: 'Hospital A - Trauma Center', eta: 3, originalType: 'Critical' },
    { id: 'AM-04', role: 'Critical', hospital: 'Hospital A - Trauma Center', eta: 7, originalType: 'Critical' },
  ],
  Burn: [
    { id: 'AM-05', role: 'Burn', hospital: 'Hospital B - Burn Unit', eta: 5, originalType: 'Burn' },
    { id: 'AM-06', role: 'Burn', hospital: 'Hospital B - Burn Unit', eta: 8, originalType: 'Burn' },
  ],
  Moderate: [
    { id: 'AM-02', role: 'Moderate', hospital: 'Hospital C - General', eta: 4, originalType: 'Moderate' },
    { id: 'AM-07', role: 'Moderate', hospital: 'Hospital C - General', eta: 6, originalType: 'Moderate' },
    { id: 'AM-08', role: 'Moderate', hospital: 'Hospital D - General', eta: 9, originalType: 'Moderate' },
    { id: 'AM-09', role: 'Moderate', hospital: 'Hospital D - General', eta: 10, originalType: 'Moderate' },
  ],
  Minor: [
    { id: 'AM-03', role: 'Minor', hospital: 'Hospital D - General', eta: 6, originalType: 'Minor' },
    { id: 'AM-10', role: 'Minor', hospital: 'Hospital C - General', eta: 8, originalType: 'Minor' },
    { id: 'AM-11', role: 'Minor', hospital: 'Hospital D - General', eta: 11, originalType: 'Minor' },
  ],
}

export function AmbulanceAssignment({ type, count, hospital, color }: AmbulanceAssignmentProps) {
  const [ambulances, setAmbulances] = useState<Ambulance[]>(initialAmbulances[type])
  const [draggedAmbulance, setDraggedAmbulance] = useState<Ambulance | null>(null)
  const [showReassign, setShowReassign] = useState(false)

  const handleReassign = (ambulance: Ambulance) => {
    // Simple reassignment demo
    const newHospitals: Record<string, string> = {
      'Critical': 'Hospital B - Trauma Center',
      'Burn': 'Hospital A - Burn Unit',
      'Moderate': 'Hospital B - General',
      'Minor': 'Hospital A - General',
    }
    
    const updated = ambulances.map((a) =>
      a.id === ambulance.id
        ? { ...a, hospital: newHospitals[type] || hospital }
        : a
    )
    setAmbulances(updated)
  }

  const handleReset = () => {
    setAmbulances(initialAmbulances[type])
  }

  const getColorClass = () => {
    switch (type) {
      case 'Critical':
        return 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
      case 'Burn':
        return 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400'
      case 'Moderate':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400'
      default:
        return 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400'
    }
  }

  return (
    <Card className="border border-border overflow-hidden">
      <div className={`px-6 py-4 border-b border-border ${getColorClass()}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-base">{type} Cases</h3>
            <p className="text-sm opacity-90">{ambulances.length} ambulances assigned</p>
          </div>
          <Badge variant="outline" className={getColorClass()}>
            {count} patients
          </Badge>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {ambulances.map((ambulance) => (
          <div
            key={ambulance.id}
            draggable
            onDragStart={() => setDraggedAmbulance(ambulance)}
            onDragEnd={() => setDraggedAmbulance(null)}
            className="rounded-lg border border-border bg-card p-4 cursor-move hover:border-primary/50 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <p className="font-semibold text-sm group-hover:text-primary transition-colors">{ambulance.id}</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Target className="h-3 w-3" />
                    <span>Role: {ambulance.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>{ambulance.hospital}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>ETA: {ambulance.eta} min</span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleReassign(ambulance)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="w-full mt-2"
        >
          Reset to Default
        </Button>
      </div>
    </Card>
  )
}
