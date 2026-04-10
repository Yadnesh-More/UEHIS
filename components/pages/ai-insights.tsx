'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, TrendingUp, Lightbulb } from 'lucide-react'

export function AIInsights() {
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
            <p>
              Current emergency response is operating at high efficiency. The multi-vehicle accident on Downtown Main Street has been successfully triaged with appropriate resource allocation. However, critical alerts require immediate attention.
            </p>
            <p>
              <strong>Key Observations:</strong> O- blood supply is critically low (3 units remaining), Hospital A is approaching capacity at 85% occupancy. Recommend immediate blood bank replenishment order and consider redirecting upcoming moderate-severity cases to Hospital B or D.
            </p>
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
                  <p className="text-xs text-muted-foreground mt-1">Probability: 72%</p>
                  <p className="text-xs text-muted-foreground">Hospital A expected to reach 95% capacity within 30 minutes</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-destructive mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Blood Supply Crisis Risk</p>
                  <p className="text-xs text-muted-foreground mt-1">Probability: 85%</p>
                  <p className="text-xs text-muted-foreground">O- and AB- types critically low; recommend emergency orders</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-yellow-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Ambulance Shortage Risk</p>
                  <p className="text-xs text-muted-foreground mt-1">Probability: 45%</p>
                  <p className="text-xs text-muted-foreground">5 of 12 units currently deployed; high demand expected</p>
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
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-sm">2. Redirect to Hospital B</p>
                <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">High Priority</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Redirect moderate cases to Hospital B to reduce Hospital A load</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-sm">3. Activate Backup Ambulances</p>
                <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">Medium Priority</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Call in 3 backup ambulances from Station 2 for standby</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-sm">4. Monitor Response Time</p>
                <Badge variant="outline">Info</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Average response time 7 min; aim to maintain below 8 min</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blood Demand Forecast</CardTitle>
          <CardDescription>Predicted consumption for next 24 hours</CardDescription>
        </CardHeader>
        <CardContent className="h-64 bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">Forecast chart placeholder</div>
        </CardContent>
      </Card>
    </div>
  )
}
