'use client'

import { useEffect, useRef, useState } from 'react'
import { useEmergency } from '@/lib/emergency-context'

export function LiveMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { ambulances, hospitals, activeCaseId } = useEmergency()
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null)
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null)
  const markers = [
    ...ambulances.map((a) => ({ id: a.id, x: a.x, y: a.y, type: 'ambulance' as const, label: a.id, status: a.status, detail: `${a.role} -> ${a.assignedHospital}` })),
    ...hospitals.map((h) => ({ id: h.name, x: h.x, y: h.y, type: 'hospital' as const, label: h.name, status: `${h.capacity}%`, detail: `Capacity ${h.capacity}%` })),
    { id: `incident-${activeCaseId}`, x: 50, y: 50, type: 'incident' as const, label: `Case #${activeCaseId}`, status: 'Active', detail: 'Emergency incident origin' },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match container
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // Clear canvas
    ctx.fillStyle = 'hsl(var(--color-muted))'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = 'hsl(var(--color-border))'
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.3
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i < canvas.height; i += 40) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    // Draw route paths (ambulance -> hospital)
    ambulances.forEach((ambulance) => {
      const hospital = hospitals.find((h) => h.name === ambulance.assignedHospital)
      if (!hospital) return
      const ax = (ambulance.x / 100) * canvas.width
      const ay = (ambulance.y / 100) * canvas.height
      const hx = (hospital.x / 100) * canvas.width
      const hy = (hospital.y / 100) * canvas.height
      ctx.strokeStyle = 'hsl(264, 80%, 65%)'
      ctx.lineWidth = 1.5
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.lineTo(hx, hy)
      ctx.stroke()
      ctx.setLineDash([])
    })

    // Draw markers
    markers.forEach((marker) => {
      const isHovered = hoveredMarker === marker.id
      const px = (marker.x / 100) * canvas.width
      const py = (marker.y / 100) * canvas.height
      const size = isHovered ? 16 : 12

      // Draw marker circle
      ctx.fillStyle =
        marker.type === 'ambulance'
          ? 'hsl(264, 100%, 50%)'
          : marker.type === 'incident'
          ? 'hsl(0, 100%, 50%)'
          : 'hsl(120, 70%, 50%)'

      ctx.beginPath()
      ctx.arc(px, py, size, 0, Math.PI * 2)
      ctx.fill()

      // Draw border
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw icon/label
      if (isHovered) {
        ctx.fillStyle = 'white'
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(marker.label, px, py)
      }
    })
  }, [hoveredMarker, markers, ambulances, hospitals])

  const handleCanvasHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const hovered = markers.find((m) => {
      const mx = (m.x / 100) * rect.width
      const my = (m.y / 100) * rect.height
      const distance = Math.sqrt((mx - x) ** 2 + (my - y) ** 2)
      return distance < 20
    })

    setHoveredMarker(hovered?.id || null)
  }

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        onMouseMove={handleCanvasHover}
        onClick={() => setSelectedMarker(hoveredMarker)}
        onMouseLeave={() => setHoveredMarker(null)}
        className="w-full border border-border rounded-lg bg-muted cursor-crosshair"
        style={{ height: '384px' }}
      />
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span>Ambulances</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-destructive" />
          <span>Incidents</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
          <span>Hospitals</span>
        </div>
      </div>
      {selectedMarker ? (
        <div className="rounded-lg border bg-card p-3 text-sm">
          {(() => {
            const marker = markers.find((m) => m.id === selectedMarker)
            if (!marker) return null
            return (
              <div>
                <p className="font-medium">{marker.label}</p>
                <p className="text-muted-foreground">{marker.detail}</p>
                <p className="text-xs mt-1">Status: {marker.status}</p>
              </div>
            )
          })()}
        </div>
      ) : null}
    </div>
  )
}
