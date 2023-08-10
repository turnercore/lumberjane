"use client";
import { useCallback, useEffect, useState } from 'react'
import { Avatar, Button, TextField, Typography } from "@mui/material";
import { useAuthContext } from '@/context/index'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import SignOutButton from './SignOutButton';

export default function AccountForm() {
  const supabase = createClientComponentClient()
  const { user } = useAuthContext()
  if (!user) return null;

  const [loading, setLoading] = useState(true)
  const [fullname, setFullname] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [website, setWebsite] = useState<string | null>(null)
  const [avatar_url, setAvatarUrl] = useState<string | null>(null)

  const getProfile = useCallback(async () => {
    try {
      setLoading(true)

      let { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name, username, website, avatar_url`)
        .eq('id', user?.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setFullname(data.full_name)
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      alert('Error loading user data!')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    getProfile()
  }, [user, getProfile])

  async function updateProfile({
    username,
    fullname,
    website,
    avatar_url,
  }: {
    username: string | null
    fullname: string | null
    website: string | null
    avatar_url: string | null
  }) {
    try {
      setLoading(true)

      let { error } = await supabase.from('profiles').upsert({
        id: user?.id as string,
        full_name: fullname,
        username,
        website,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      alert('Profile updated!')
    } catch (error) {
      alert('Error updating the data!')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      border: '1px solid #ccc',
      borderRadius: '0.5rem',
      maxWidth: '500px',
      margin: '0 auto',
    }}>
      <Avatar alt="User's Avatar" src={avatar_url?.toString()} style={{ width: '250px', height: '250px' }} />
      <Typography variant="h6">{user.email}</Typography>
      <TextField
        id="fullName"
        label="Full Name"
        variant="outlined"
        value={fullname || ''}
        onChange={(e) => setFullname(e.target.value)}
        style={{ width: '100%' }}
      />
      <TextField
        id="username"
        label="Username"
        variant="outlined"
        value={username || ''}
        onChange={(e) => setUsername(e.target.value)}
        style={{ width: '100%' }}
      />
      <TextField
        id="website"
        label="Website"
        variant="outlined"
        value={website || ''}
        onChange={(e) => setWebsite(e.target.value)}
        style={{ width: '100%' }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => updateProfile({ fullname, username, website, avatar_url })}
        disabled={loading}
        style={{ width: '100%', marginTop: '1rem' }}
      >
        {loading ? 'Loading ...' : 'Update'}
      </Button>
      <SignOutButton />
    </div>
  )
}