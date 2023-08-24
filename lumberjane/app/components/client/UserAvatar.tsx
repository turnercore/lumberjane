"use client";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { User, createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import SignOutButton from "./SignOutButton";
import { useEffect, useState } from "react";
import { Profile } from "@/types";

export default function UserAvatar() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState< User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarFallback, setAvatarFallback] = useState<string>("🪵");
  const [isHovered, setIsHovered] = useState(false);

  const getSupabaseUser = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data) return null;
      if (!data.session) return null;
      if (!data.session.user) return null;
      setUser(data.session.user);
    } catch (error: any) {
      console.error(error.message);
    }
  }

  const fetchProfile = async () => {
    try {
      if(!user) return;
      const { data: fetchedProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
  
      setAvatarFallback(fetchedProfile.username
      ? fetchedProfile.username[0].toUpperCase()
      : "LJ");
  
      setProfile(fetchedProfile);
    } catch(error: any) {
      console.error(error.message);
    }
  }

  //Get user on mount
  useEffect(() => {
    getSupabaseUser();
  }, []);

  //When user changes, get the user's profile from supabase
  useEffect(() => {
    if (!user) return;
      // Fetch the user's profile
      fetchProfile();
  }, [user]);


  const notLoggedInHtml = (
    <Link href="/login">
      <Avatar className="w-14 h-14 cursor-pointer bg-primary">
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    </Link>
  );

  if (!user) return notLoggedInHtml;
  if (!profile) return notLoggedInHtml;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
      <Avatar
        className="w-14 h-14 cursor-pointer bg-primary transition-all duration-300 hover:shadow-lg hover">
        <AvatarImage
          className="w-full h-full object-cover object-center"
          src={profile.avatar_url}
        ></AvatarImage>
        <AvatarFallback>{avatarFallback}</AvatarFallback>
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
  );
}