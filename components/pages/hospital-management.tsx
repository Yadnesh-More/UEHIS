'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useEmergency } from '@/lib/emergency-context'

export function HospitalManagement() {
  const { hospitals, toggleHospitalIntake } = useEmergency()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Red':
        return 'destructive'
      case 'Yellow':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Green':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      case 'Yellow':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
      case 'Red':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Hospital Management</h1>
        <p className="text-muted-foreground">Real-time hospital capacity and resource monitoring</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {hospitals.map((hospital) => (
          <Card key={hospital.name}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{hospital.name}</CardTitle>
                  <CardDescription>Resource availability</CardDescription>
                </div>
                <Badge variant={getStatusColor(hospital.status)} className={getStatusBadgeClass(hospital.status)}>
                  {hospital.status} Status
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Accept Incoming Cases</p>
                  <p className="text-xs text-muted-foreground">
                    {hospital.acceptsIncoming ? 'Enabled for ambulance intake' : 'Diversion mode active'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={hospital.acceptsIncoming ? 'default' : 'outline'}
                  onClick={() => toggleHospitalIntake(hospital.name)}
                >
                  {hospital.acceptsIncoming ? 'Accepting' : 'Diverting'}
                </Button>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Bed Capacity</p>
                  <span className="text-sm text-muted-foreground">{hospital.capacity}%</span>
                </div>
                <Progress value={hospital.capacity} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">ICU Beds Available</p>
                  <p className="text-xl font-bold">{hospital.icu}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">General Beds Available</p>
                  <p className="text-xl font-bold">{hospital.general}</p>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground mb-2">Available Doctors</p>
                <p className="text-xl font-bold mb-3">{hospital.doctors}</p>
                <div className="flex flex-wrap gap-2">
                  {hospital.specializations.map((spec) => (
                    <Badge key={spec} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hospital Comparison</CardTitle>
          <CardDescription>Side-by-side resource availability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ICU Beds</TableHead>
                  <TableHead>General Beds</TableHead>
                  <TableHead>Doctors</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Incoming Cases</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hospitals.map((hospital) => (
                  <TableRow key={hospital.name}>
                    <TableCell className="font-medium">{hospital.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeClass(hospital.status)}>
                        {hospital.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{hospital.icu}</TableCell>
                    <TableCell>{hospital.general}</TableCell>
                    <TableCell>{hospital.doctors}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={hospital.capacity} className="h-2 w-20" />
                        <span className="text-sm">{hospital.capacity}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={hospital.acceptsIncoming ? 'default' : 'outline'}
                        onClick={() => toggleHospitalIntake(hospital.name)}
                      >
                        {hospital.acceptsIncoming ? 'Accepting' : 'Diverting'}
                      </Button>
                    </TableCell>
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
