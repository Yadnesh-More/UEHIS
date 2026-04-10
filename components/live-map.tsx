'use client'

import { useEffect, useRef, useState } from 'react'
import { Ambulance, MapPin, AlertTriangle } from 'lucide-react'

interface Marker {
  id: string
  x: number
  y: number
  type: 'ambulance' | 'incident' | 'hospital'
  label: string
  status?: string
}

const markers: Marker[] = [
  { id: '1', x: 180, y: 150, type: 'ambulance', label: 'AM-01', status: 'En Route' },
  { id: '2', x: 250, y: 200, type: 'ambulance', label: 'AM-02', status: 'En Route' },
  { id: '3', x: 320, y: 280, type: 'incident', label: 'Incident', status: 'Active' },
  { id: '4', x: 400, y: 150, type: 'hospital', label: 'Hospital A' },
  { id: '5', x: 100, y: 320, type: 'hospital', label: 'Hospital B' },
  { id: '6', x: 450, y: 320, type: 'hospital', label: 'Hospital C' },
  { id: '7', x: 80, y: 80, type: 'ambulance', label: 'AM-03', status: 'Available' },
]

export function LiveMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null)

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

    // Draw markers
    markers.forEach((marker) => {
      const isHovered = hoveredMarker === marker.id
      const size = isHovered ? 16 : 12

      // Draw marker circle
      ctx.fillStyle =
        marker.type === 'ambulance'
          ? 'hsl(264, 100%, 50%)'
          : marker.type === 'incident'
          ? 'hsl(0, 100%, 50%)'
          : 'hsl(120, 70%, 50%)'

      ctx.beginPath()
      ctx.arc(marker.x, marker.y, size, 0, Math.PI * 2)
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
        ctx.fillText(marker.label, marker.x, marker.y)
      }
    })
  }, [hoveredMarker])

  const handleCanvasHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const hovered = markers.find((m) => {
      const distance = Math.sqrt((m.x - x) ** 2 + (m.y - y) ** 2)
      return distance < 20
    })

    setHoveredMarker(hovered?.id || null)
  }

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        onMouseMove={handleCanvasHover}
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
    </div>
  )
}
