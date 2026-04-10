'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Users, Clock, ChevronDown } from 'lucide-react'
import { NewCaseModal } from '@/components/new-case-modal'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useEmergency } from '@/lib/emergency-context'

export function EmergencyCaseManagement() {
  const { cases, activeCaseId, setActiveCase, runAITriage, aiLoading } = useEmergency()
  const [expandedCase, setExpandedCase] = useState<number | null>(activeCaseId)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Emergency Case Management</h1>
          <p className="text-muted-foreground">Create and monitor emergency incidents</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => runAITriage()} disabled={aiLoading}>
            {aiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Run AI Triage
          </Button>
          <NewCaseModal />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {cases.map((caseItem) => (
          <Collapsible
            key={caseItem.id}
            open={expandedCase === caseItem.id}
            onOpenChange={(open) => setExpandedCase(open ? caseItem.id : null)}
          >
            <Card className="hover:border-primary/50 transition-colors overflow-hidden">
              <CollapsibleTrigger asChild>
                <div className="cursor-pointer" onClick={() => setActiveCase(caseItem.id)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          Case #{caseItem.id}
                          {activeCaseId === caseItem.id ? <Badge>Active Case</Badge> : null}
                        </CardTitle>
                        <CardDescription>{caseItem.type}</CardDescription>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={caseItem.status === 'Active' ? 'destructive' : 'secondary'}>
                          {caseItem.status}
                        </Badge>
                        <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Location
                        </p>
                        <p className="font-medium">{caseItem.location}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Estimated Victims
                        </p>
                        <p className="font-medium">{caseItem.victims} people</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Time
                        </p>
                        <p className="font-medium">{caseItem.timeAgo} min ago</p>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="border-t border-border px-6 py-4 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Severity Distribution</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
                        Critical: {caseItem.severity.Critical}
                      </Badge>
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">
                        Burn: {caseItem.severity.Burn}
                      </Badge>
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">
                        Moderate: {caseItem.severity.Moderate}
                      </Badge>
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                        Minor: {caseItem.severity.Minor}
                      </Badge>
                    </div>
                  </div>

                  {caseItem.timeline.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-3">Timeline</p>
                      <div className="space-y-2">
                        {caseItem.timeline.map((entry, idx) => (
                          <div key={idx} className="flex gap-3 text-sm">
                            <span className="font-mono text-muted-foreground flex-shrink-0">{entry.time}</span>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                              <p>{entry.event}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}
