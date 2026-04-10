'use client'

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useEmergency } from '@/lib/emergency-context'

export function MainNav() {
  const { theme, setTheme } = useTheme()
  const { activeCaseId, aiLoading } = useEmergency()
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    setMounted(true)
    // Update time every second
    const timer = setInterval(() => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      }))
    }, 1000)
    
    setTime(new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    }))

    return () => clearInterval(timer)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">U</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">UEHIS</h1>
            <p className="text-xs text-muted-foreground">Emergency Command Center</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="rounded-lg border px-3 py-2 text-xs font-medium">
            Active Case: #{activeCaseId} {aiLoading ? '(AI processing...)' : ''}
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono text-foreground">{time || '00:00:00'}</span>
          </div>

          {mounted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9 p-0"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
