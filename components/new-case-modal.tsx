'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import { useEmergency } from '@/lib/emergency-context'

export function NewCaseModal() {
  const { createCase } = useEmergency()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    location: '',
    caseType: '',
    estimatedVictims: '',
    description: '',
  })

  const handleSubmit = () => {
    createCase({
      location: formData.location,
      caseType: formData.caseType,
      estimatedVictims: Number(formData.estimatedVictims || 1),
      description: formData.description,
    })
    setOpen(false)
    setFormData({ location: '', caseType: '', estimatedVictims: '', description: '' })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Case
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Emergency Case</DialogTitle>
          <DialogDescription>
            Register a new emergency incident and auto-generate initial assignments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Downtown Main Street"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="type">Incident Type</Label>
            <Select value={formData.caseType} onValueChange={(value) => setFormData({ ...formData, caseType: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select incident type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="accident">Vehicle Accident</SelectItem>
                <SelectItem value="fire">Fire/Explosion</SelectItem>
                <SelectItem value="medical">Medical Emergency</SelectItem>
                <SelectItem value="trauma">Traumatic Injury</SelectItem>
                <SelectItem value="drowning">Drowning</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="victims">Estimated Number of Victims</Label>
            <Input
              id="victims"
              type="number"
              placeholder="e.g., 12"
              value={formData.estimatedVictims}
              onChange={(e) => setFormData({ ...formData, estimatedVictims: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the incident and any known details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1"
              rows={4}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Create Case</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
