import { Avatar, Button, FormControlLabel, Grid, Switch } from "@mui/material";
import Logo from "../clientComponents/Logo";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function Header() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.auth.getSession();
  const user = data?.session?.user || null;

  return (
    <Grid container justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
      <Grid item>
        <Logo />
      </Grid>
      <Grid item>
        <p>{!user ? '' : user.email}</p>
      </Grid>
      <Grid item>
        <div style={{ display: "flex" }}>
        <Link href={user ? "/account" : "/login"}>
          <Avatar 
            sx={{ width: 56, height: 56, bgcolor: "primary.main", cursor: "pointer"}} 
            >
                🪵
          </Avatar>
        </Link>
        </div>
    </Grid>
    </Grid>
  );
}