'use client'
import { useForm } from "react-hook-form"
import { Button, Form, FormField, FormControl, FormDescription, FormItem, FormLabel, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, Input, DialogClose } from "@/components/ui"
import { ChangeEventHandler, useEffect, useState } from 'react'
import { toast } from "react-toastify"
import { User, createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { v4 as uuidv4 } from 'uuid'

type ProfilePictureUploadButtonProps = {
  children: React.ReactNode
  className?: string
  setProfileImageUrl: React.Dispatch<React.SetStateAction<string>>
}

export const ProfilePictureUploadButton = ({ children, className = '', setProfileImageUrl }: ProfilePictureUploadButtonProps) => {
  const [user, setUser] = useState<null | User>(null)

  useEffect(() => {
    const setUserFromSupabaseSession = async () => {
      const supabase = createClientComponentClient()
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionData.session) {
        toast.error('Error getting session data from supabase.')
        return
      }
      setUser(sessionData.session.user)
    }
    
    setUserFromSupabaseSession()
  }, [])

  const form = useForm<{ image: File | null }>({
    defaultValues: {
      image: null,
    },
  })

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      form.setValue('image', file)
    }
  }

  const onSubmit = async (data: { image: File | null }) => {
    const file = data.image
    if (file) {
      //Create a uuid for the image
      const uuid = uuidv4()
      form.reset()
      const supabase = createClientComponentClient()
      const {data, error} = await supabase.storage.from('avatars').upload(`${user?.id}/${uuid}`, file, {upsert: true})
      if (error || !data) {
        toast.error(error?.message || 'Error uploading profile picture.')
        return
      }
      else {
        toast.success('Profile picture uploaded.')
      }

      //Grab the avatar_url from the storage bucket
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(`${user?.id}/${uuid}`)
      const cdnUrl = urlData?.publicUrl
      console.log(cdnUrl)

      // Get old uuid from the profiles table and delete it from the storage bucket
      const { data: oldUuidData } = await supabase.from('profiles').select('avatar_url').eq('id', user?.id)
      const oldUuid = oldUuidData?.[0]?.avatar_url?.split('/').pop()
      console.log(oldUuid)
      const { data: deleteData, error: deleteError } = await supabase.storage.from('avatars').remove([`${user?.id}/${oldUuid}`])
      if (deleteError) {
        console.log(deleteError)
        toast.error(deleteError?.message || 'Error deleting old profile picture.')
        return
      }
      else {
        toast.success(`Old profile picture deleted.`)
      }

      //Update the avatar_url in the profiles table
      const { data: userUpdateData, error: userUpdateError } = await supabase.from('profiles').update({ avatar_url: cdnUrl }).eq('id', user?.id)
      
      if (userUpdateError) {
        console.log(userUpdateError)
        toast.error(userUpdateError?.message || 'Error updating user profile.')
        return
      }
      else {
        toast.success(`User profile updated.`)
        setProfileImageUrl(cdnUrl || '')
      }
    
    }
  }

  return (
    <Dialog>
      <DialogTrigger className={className}>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Profile Picture</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar Image</FormLabel>
                <FormControl>
                  <Input type="file" accept="image/*" onChange={handleFileChange} />
                </FormControl>
                <FormDescription>Upload an image file.</FormDescription>
              </FormItem>
            )}
          />
          <DialogClose asChild>
            <Button type="submit">Upload Image</Button>
          </DialogClose>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
