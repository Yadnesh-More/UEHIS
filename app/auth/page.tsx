'use client'

import { useEffect, useState, type ComponentType, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, Droplet, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'
import type { AuthRole } from '@/lib/auth-types'
import { ROLE_LABELS } from '@/lib/auth-types'

function RoleOption({
  value,
  id,
  icon: Icon,
  title,
  description,
}: {
  value: AuthRole
  id: string
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
      <RadioGroupItem value={value} id={id} className="mt-1" />
      <Label htmlFor={id} className="cursor-pointer font-normal leading-snug">
        <span className="flex items-center gap-2 font-medium text-foreground">
          <Icon className="h-4 w-4 shrink-0 text-primary" />
          {title}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {description}
        </span>
      </Label>
    </div>
  )
}

export default function AuthPage() {
  const router = useRouter()
  const { session, hydrated, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [role, setRole] = useState<AuthRole>('hospital')

  useEffect(() => {
    if (hydrated && session) {
      router.replace('/')
    }
  }, [hydrated, session, router])

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <p className="text-sm">Loading…</p>
      </div>
    )
  }

  if (session) {
    return null
  }

  const needsOrg = role === 'hospital' || role === 'blood_bank'

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const em = email.trim()
    if (!em) return
    signIn({
      email: em,
      role,
      organizationName: needsOrg ? organizationName : undefined,
    })
    router.push('/')
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">U</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            UEHIS access
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in or create a profile by role. No real accounts or
            verification.
          </p>
        </div>

       

        <Card className="border-border/80 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Hospital · Blood bank · Civilian</CardTitle>
            <CardDescription>
              Choose a role, then use sign in or sign up to continue
            </CardDescription>
          </CardHeader>
          <Tabs defaultValue="signin" className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="pt-4 pb-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <AuthFields
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  organizationName={organizationName}
                  setOrganizationName={setOrganizationName}
                  role={role}
                  setRole={setRole}
                  needsOrg={needsOrg}
                />
                <Button type="submit" className="w-full">
                  Continue as {ROLE_LABELS[role]}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="pt-4 pb-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <AuthFields
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  organizationName={organizationName}
                  setOrganizationName={setOrganizationName}
                  role={role}
                  setRole={setRole}
                  needsOrg={needsOrg}
                />
                <Button type="submit" className="w-full">
                  Create profile
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <CardFooter className="flex flex-col gap-2 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
            <span>
              Returning to the app?{' '}
              <Link href="/" className="text-primary underline-offset-4 hover:underline">
                Command center home
              </Link>
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

function AuthFields({
  email,
  setEmail,
  password,
  setPassword,
  organizationName,
  setOrganizationName,
  role,
  setRole,
  needsOrg,
}: {
  email: string
  setEmail: (v: string) => void
  password: string
  setPassword: (v: string) => void
  organizationName: string
  setOrganizationName: (v: string) => void
  role: AuthRole
  setRole: (r: AuthRole) => void
  needsOrg: boolean
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Role</Label>
        <RadioGroup
          value={role}
          onValueChange={(v) => setRole(v as AuthRole)}
          className="grid gap-2"
        >
          <RoleOption
            value="hospital"
            id="role-hospital"
            icon={Building2}
            title="Hospital"
            description="Full command and operations views."
          />
          <RoleOption
            value="blood_bank"
            id="role-blood"
            icon={Droplet}
            title="Blood bank"
            description="Blood resources, cases context, and reports."
          />
          <RoleOption
            value="civilian"
            id="role-civilian"
            icon={User}
            title="Civilian"
            description="Limited dashboard and public-style reports."
          />
        </RadioGroup>
      </div>
      {needsOrg ? (
        <div className="space-y-2">
          <Label htmlFor="org">Organization name</Label>
          <Input
            id="org"
            name="organization"
            autoComplete="organization"
            placeholder="e.g. Central Regional Hospital"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
          />
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.org"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password (ignored)</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Any text — not validated"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
    </>
  )
}
