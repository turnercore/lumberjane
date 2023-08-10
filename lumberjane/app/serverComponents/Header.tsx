import * as React from "react";
import { Avatar, Button, FormControlLabel, Grid, Switch } from "@mui/material";
import Logo from "../clientComponents/Logo";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/context";

export default function Header({ switchTheme }: { switchTheme: any }) {
    const { user } = useAuthContext();
    const pathname = usePathname();
    const router = useRouter();

  const handleAvatarClick = () => {
    router.push("/account");
  };

  return (
    <Grid container justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
      <Grid item>
        <FormControlLabel
          control={
            <Switch
              onChange={switchTheme}
              name="checkedA"
              inputProps={{ "aria-label": "secondary checkbox" }}
            />
          }
          label={switchTheme ? "Dark" : "Light"}
        />
      </Grid>
      <Grid item>
        <Logo />
      </Grid>
      <Grid item>
        <p>{!user ? '' : user.email}</p>
      </Grid>
      <Grid item>
        <div style={{ display: "flex" }}>
          <Button
            variant="contained"
            onClick={() => {
              router.push("/login");
            }}
            sx={{ mr: 1 }}
          >
            Login
          </Button>
          <Avatar 
            sx={{ width: 56, height: 56, bgcolor: "primary.main", cursor: "pointer"}} 
            onClick={handleAvatarClick}
            >
                🪵
          </Avatar>
        </div>
      </Grid>
    </Grid>
  );
}