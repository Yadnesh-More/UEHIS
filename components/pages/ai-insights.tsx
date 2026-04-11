'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, TrendingUp, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useEmergency } from '@/lib/emergency-context'

export function AIInsights() {
  const { applyRecommendation, redirectAmbulances, requestBloodUnits, aiLoading, cases, activeCaseId, bloodUnits, hospitals, ambulances } =
    useEmergency()

  const activeCase = cases.find((c) => c.id === activeCaseId) ?? cases[0]
  const mostLoadedHospital = useMemo(
    () => (hospitals.length ? [...hospitals].sort((a, b) => b.capacity - a.capacity)[0] : undefined),
    [hospitals]
  )
  const reliefHospital = useMemo(() => {
    const accepting = hospitals.filter((h) => h.acceptsIncoming)
    return accepting.length ? [...accepting].sort((a, b) => a.capacity - b.capacity)[0] : undefined
  }, [hospitals])

  const bloodForecastData = useMemo(() => {
    const demand = Math.max(0, cases.reduce((a, c) => a + c.victims, 0))
    const hours = [0, 4, 8, 12, 16, 20, 24]
    return hours.map((h) => ({
      t: h === 24 ? '24h' : `${h}h`,
      oNeg: Math.max(0, Math.round(bloodUnits.oNegative - (demand * h) / 40)),
      abNeg: Math.max(0, Math.round(bloodUnits.abNegative - (demand * h) / 55)),
    }))
  }, [cases, bloodUnits])

  const summaryParagraphs = useMemo(() => {
    if (!activeCase) {
      return {
        p1: 'No active case data is loaded yet. Create a case in Emergency Case Management to populate AI context.',
        p2: '',
      }
    }
    const o = bloodUnits.oNegative
    const ab = bloodUnits.abNegative
    const cap = mostLoadedHospital?.capacity ?? 0
    const loadName = mostLoadedHospital?.name ?? 'the busiest facility'
    return {
      p1: `Current focus: Case #${activeCase.id} (${activeCase.type}) at ${activeCase.location}. Estimated ${activeCase.victims} people involved; triage counts are synced from the database.`,
      p2: `Key observations from live data: O− supply is at ${o} units and AB− at ${ab} units. ${
        mostLoadedHospital ? `${loadName} is at about ${cap}% capacity` : 'Hospital metrics are loading'
      }. ${o < 7 || ab < 7 ? 'Blood replenishment should be prioritized.' : 'Blood levels are within watch thresholds.'}`,
    }
  }, [activeCase, bloodUnits, mostLoadedHospital])

  const overloadRisk = mostLoadedHospital ? Math.min(95, Math.round(55 + mostLoadedHospital.capacity * 0.35)) : 72
  const bloodCrisisRisk = Math.min(95, Math.round(60 + (10 - Math.min(bloodUnits.oNegative, bloodUnits.abNegative)) * 5))
  const ambulanceShortageRisk = Math.min(
    95,
    Math.round(((ambulances.filter((a) => a.status === 'En Route' || a.status === 'Busy').length) / Math.max(1, ambulances.length)) * 90)
  )

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Insights & Predictions</h1>
        <p className="text-muted-foreground">AI-powered recommendations and forecasting</p>
      </div>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            AI Assistant Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm leading-relaxed">
            <p>{summaryParagraphs.p1}</p>
            {summaryParagraphs.p2 ? (
              <p>
                <strong>Key observations:</strong> {summaryParagraphs.p2}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Risk Predictions
            </CardTitle>
            <CardDescription>Next 2 hours forecast</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-yellow-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Hospital Overload Risk</p>
                  <p className="text-xs text-muted-foreground mt-1">Probability: {overloadRisk}%</p>
                  <p className="text-xs text-muted-foreground">
                    {mostLoadedHospital
                      ? `${mostLoadedHospital.name} at ${mostLoadedHospital.capacity}% capacity (from database)`
                      : 'No hospital records loaded'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-destructive mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Blood Supply Crisis Risk</p>
                  <p className="text-xs text-muted-foreground mt-1">Probability: {bloodCrisisRisk}%</p>
                  <p className="text-xs text-muted-foreground">
                    O− {bloodUnits.oNegative} units, AB− {bloodUnits.abNegative} units (live inventory)
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-yellow-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Ambulance Shortage Risk</p>
                  <p className="text-xs text-muted-foreground mt-1">Probability: {ambulanceShortageRisk}%</p>
                  <p className="text-xs text-muted-foreground">
                    {ambulances.filter((a) => a.status === 'En Route' || a.status === 'Busy').length} of {ambulances.length}{' '}
                    units deployed or busy
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recommended Actions
            </CardTitle>
            <CardDescription>Prioritized suggestions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-sm">1. Request Blood Replenishment</p>
                <Badge className="bg-destructive/10 text-destructive border-destructive/20">Critical</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Order 20 O- and 15 AB- units from regional blood bank</p>
              <Button size="sm" className="mt-3" onClick={requestBloodUnits} disabled={aiLoading}>
                Request Blood Units
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-sm">
                  2. Redirect to {reliefHospital?.name ?? 'relief facility'}
                </p>
                <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">High Priority</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Redirect moderate cases toward {reliefHospital?.name ?? 'the least-loaded accepting hospital'} to ease pressure on{' '}
                {mostLoadedHospital?.name ?? 'high-utilization sites'}
              </p>
              <Button size="sm" variant="outline" className="mt-3" onClick={redirectAmbulances} disabled={aiLoading}>
                Redirect Ambulances
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-sm">3. Activate Backup Ambulances</p>
                <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">Medium Priority</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Call in 3 backup ambulances from Station 2 for standby</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={applyRecommendation} disabled={aiLoading}>
                Apply Recommendation
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-sm">4. Monitor Response Time</p>
                <Badge variant="outline">Info</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Open cases: {cases.length}. Keep average response under 8 min as utilization rises.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blood Demand Forecast</CardTitle>
          <CardDescription>Projected O− / AB− levels from current case volume and inventory</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={bloodForecastData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="t" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="oNeg" name="O− units" stroke="hsl(0, 84%, 50%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="abNeg" name="AB− units" stroke="hsl(264, 100%, 50%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
