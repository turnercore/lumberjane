import Logo from "../client/Logo";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import UserAvatar from "./UserAvatar";

export default async function Header() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.auth.getSession();
  const user = data?.session?.user || null;

  return (
    <div className="flex justify-between items-center p-4">
      <div>
        <Logo />
      </div>
      <div className="flex">
        <Link href={user ? "/account" : "/login"}>
          <UserAvatar />
        </Link>
      </div>
    </div>
  );
}
