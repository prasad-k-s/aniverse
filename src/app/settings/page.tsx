import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AvatarUpload } from '@/components/settings/avatar-upload'
import { ProfileForm } from '@/components/settings/profile-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  if (!isSupabaseConfigured) redirect('/login')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/settings')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/')

  const name = profile.display_name || profile.username

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>Shown next to your reviews and comments.</CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUpload userId={user.id} name={name} avatarUrl={profile.avatar_url} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Signed in as {user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaultValues={{
              username: profile.username,
              displayName: profile.display_name ?? '',
              bio: profile.bio ?? '',
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
