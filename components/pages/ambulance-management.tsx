'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LiveMap } from '@/components/live-map'
import { useEmergency } from '@/lib/emergency-context'

export function AmbulanceManagement() {
  const { ambulances } = useEmergency()
  const enRoute = ambulances.filter((a) => a.status === 'En Route').length
  const available = ambulances.filter((a) => a.status === 'Available').length

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ambulance Management</h1>
        <p className="text-muted-foreground">Track fleet status and assignments</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Fleet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ambulances.length}</div>
            <p className="text-xs text-muted-foreground">operational units</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Route</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{enRoute}</div>
            <p className="text-xs text-muted-foreground">active assignments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{available}</div>
            <p className="text-xs text-muted-foreground">ready for dispatch</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fleet Status</CardTitle>
          <CardDescription>Real-time ambulance positions and assignments</CardDescription>
        </CardHeader>
        <CardContent className="mb-4">
          <LiveMap />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ambulance Details</CardTitle>
          <CardDescription>All units status and assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Current Patient</TableHead>
                  <TableHead>ETA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ambulances.map((ambulance) => (
                  <TableRow key={ambulance.id}>
                    <TableCell className="font-medium">{ambulance.id}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          ambulance.status === 'Available'
                            ? 'outline'
                            : ambulance.status === 'En Route'
                            ? 'default'
                            : 'secondary'
                        }
                        className={
                          ambulance.status === 'Available'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : ambulance.status === 'En Route'
                            ? 'bg-primary/10'
                            : ''
                        }
                      >
                        {ambulance.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {ambulance.assignedHospital}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{ambulance.role}</TableCell>
                    <TableCell className="font-mono text-sm">{ambulance.etaMin ? `${ambulance.etaMin} min` : '-'}</TableCell>
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
