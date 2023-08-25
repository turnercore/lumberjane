"use client"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui"
import { User, createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import SignOutButton from "./SignOutButton"
import { useEffect, useState } from "react"
import { Profile } from "@/types"
import { GiAxeInStump, GiSkeletonInside } from "react-icons/gi"

export default function UserAvatar() {
  const [user, setUser] = useState< User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  //Get user on mount
  useEffect(() => {
    const getSupabaseUser = async () => {
      try {
        const supabase = createClientComponentClient()
        const { data } = await supabase.auth.getSession()
        if (!data) return null
        if (!data.session) return null
        if (!data.session.user) return null
        setUser(data.session.user)
      } catch (error: any) {
        console.error(error.message)
      }
    }

    getSupabaseUser()
  }, [])

  //When user changes, get the user's profile from supabase
  useEffect(() => {
    if (!user) return
      // Fetch the user's profile
      const fetchProfile = async () => {
        try {
          if(!user) return
          const supabase = createClientComponentClient()
          const { data: fetchedProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
      
          setProfile(fetchedProfile)
        } catch(error: any) {
          console.error(error.message)
        }
      }
      fetchProfile()
  }, [user])


  const notLoggedInHtml = (
    <Link href="/login">
      <Avatar className="w-14 h-14 cursor-pointer hover:shadow hover:scale-105 active:scale-100 active:shadow-inner">
        <AvatarFallback> <GiAxeInStump className=' w-full h-full'/> </AvatarFallback>
      </Avatar>
    </Link>
  )

  if (!user) return notLoggedInHtml
  if (!profile) return notLoggedInHtml
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
      <Avatar
        className="w-14 h-14 cursor-pointer bg-primary transition-all duration-300 hover:shadow-lg hover">
        <AvatarImage
          className="w-full h-full object-cover object-center"
          src={profile.avatar_url}
        ></AvatarImage>
        <AvatarFallback><GiSkeletonInside /></AvatarFallback>
      </Avatar>
      
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <Link href="/tokens">
          <DropdownMenuItem>Tokens</DropdownMenuItem>
        </Link>
        <Link href="/keys">
          <DropdownMenuItem>Keys</DropdownMenuItem>
        </Link>
        <Link href="/account">
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </Link>
        <DropdownMenuItem className = 'justify-center items-center'>
          <SignOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}