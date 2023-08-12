import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import SignOutButton from "../client/SignOutButton";

export default async function UserAvatar() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.auth.getSession();
  const user = data?.session?.user || null;

  const notLoggedInHtml = (
    <Link href="/login">
      <Avatar className="w-14 h-14 cursor-pointer bg-primary">
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    </Link>
  );

  if (!user) return notLoggedInHtml;

  // Fetch the user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile) return notLoggedInHtml;
  const avatarFallback = profile.username
    ? profile.username[0].toUpperCase()
    : "LJ";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="w-14 h-14 cursor-pointer bg-primary">
          <AvatarImage
            className="w-full h-full object-cover object-center"
            src={profile.avatar_url}
          ></AvatarImage>
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <Link href="/dashboard">
          <DropdownMenuItem>Dashboard</DropdownMenuItem>
        </Link>
        <Link href="/keys">
          <DropdownMenuItem>Keys</DropdownMenuItem>
        </Link>
        <Link href="/account">
          <DropdownMenuItem>Account</DropdownMenuItem>
        </Link>
        <DropdownMenuItem>
          <SignOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}








// import { Avatar, 
//   AvatarImage, 
//   AvatarFallback,   
//   NavigationMenu,
//   NavigationMenuContent,
//   NavigationMenuItem,
//   NavigationMenuLink,
//   NavigationMenuList,
//   NavigationMenuTrigger,
//   NavigationMenuViewport, } from '@/components/ui'
// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
// import { cookies } from "next/headers"
// import Link from 'next/link';
// import SignOutButton from '../client/SignOutButton';

// export default async function UserAvatar() {
//   const supabase = createServerComponentClient({ cookies });
//   const { data } = await supabase.auth.getSession();
//   const user = data?.session?.user || null;

//   const notLoggedInHtml = (
//     <Link href="/login">
//       <Avatar className="w-14 h-14 cursor-pointer bg-primary">
//         <AvatarFallback>?</AvatarFallback>
//       </Avatar>
//     </Link>
//   );

//   if (!user) return notLoggedInHtml;

//   // Fetch the user's profile
//   const { data: profile } = await supabase
//     .from("profiles")
//     .select("*")
//     .eq("id", user.id)
//     .single();
//   if (!profile) return notLoggedInHtml;
//   const avatarFallback = profile.username
//     ? profile.username[0].toUpperCase()
//     : "LJ";

//     return (
//       <NavigationMenu>
//         <NavigationMenuList>
//           <NavigationMenuItem>
//             <NavigationMenuTrigger>
//               <Avatar className="w-14 h-14 cursor-pointer bg-primary">
//                 <AvatarImage
//                   className="w-full h-full object-cover object-center"
//                   src={profile.avatar_url}
//                 ></AvatarImage>
//                 <AvatarFallback>{avatarFallback}</AvatarFallback>
//               </Avatar>
//             </NavigationMenuTrigger>
//             <NavigationMenuContent>
//               <ul className="grid gap-3 p-6">
//                 <Link href="/dashboard" title="Dashboard"> Dashboard </ Link>
//                 <Link href="/keys" title="Keys"> Keys </ Link>
//                 <Link href="/account" title="Account"> Account </ Link>
//                 <SignOutButton />
//               </ul>
//             </NavigationMenuContent>
//           </NavigationMenuItem>
//           {/* Other menu items can go here */}
//         </NavigationMenuList>
//       </NavigationMenu>
//     );
//   }