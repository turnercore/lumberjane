import Link from "next/link";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  Button,
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui";
import KeyAddDialog from '@/components/client/KeyAddDialog'; // Import KeyAddDialog component
import { cookies } from "next/headers"
export const dynamic = 'force-dynamic'

const navigationMenuTriggerStyle = "group inline-flex h-10 w-max rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"

export default async function NavBar() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.auth.getSession();
  const user = data?.session?.user;

  return (
    <NavigationMenu>
      <NavigationMenuList>
      <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle}>
              Home
            </NavigationMenuLink>
          </Link>
      </NavigationMenuItem>

        {process.env.DISABLE_ABOUT !== "true" && (
        <NavigationMenuItem>
          <Link href="/about" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle}>
              About
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        )}

        {process.env.DISABLE_DOCS !== "true" && (
        <NavigationMenuItem>
          <Link href="/docs" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle}>
              Docs
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        )}

        {process.env.DISABLE_COMMERCIAL !== "true" && (
          <NavigationMenuItem>
            <Link href="/pricing" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle}>
                Pricing
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        )}

        {user ? (
          <NavigationMenuItem>
            <NavigationMenuTrigger className={navigationMenuTriggerStyle}> Dashboard</NavigationMenuTrigger>
              <NavigationMenuContent className="flex flex-col w-[400px] gap-3 p-4 md:w-[500px] lg:w-[600px]">
                <div className="flex items-center justify-between">
                  <Link href='/keys' passHref legacyBehavior>
                    <NavigationMenuLink className={navigationMenuTriggerStyle + " flex-grow text-left"} style={{ width: "50%" }}>
                      Keys
                    </NavigationMenuLink>
                  </Link>
                  <TooltipProvider>
                  <Tooltip>
                    <KeyAddDialog>
                      <TooltipTrigger asChild>
                          <Button variant='outline' size='icon'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          </Button>
                      </TooltipTrigger>
                    </KeyAddDialog>
                    <TooltipContent>
                      <p>Create a new key.</p>
                    </TooltipContent>
                  </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center justify-between">
                  <Link href='/tokens' passHref legacyBehavior>
                    <NavigationMenuLink className={navigationMenuTriggerStyle + " flex-grow text-left"} style={{ width: "50%" }}>
                      Tokens
                    </NavigationMenuLink>
                  </Link>
                  <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href='/tokens/create'>
                        <Button variant='outline' size='icon'>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Create a new token.</p>
                    </TooltipContent>
                  </Tooltip>
                  </TooltipProvider>
                  
                </div>
                <div className="flex items-center">
                <Link href='/account' passHref legacyBehavior>
                  <NavigationMenuLink className={navigationMenuTriggerStyle + ' flex-grow text-left'}>
                    Account
                  </NavigationMenuLink>
                </Link>
                </div>
              </NavigationMenuContent>
          </NavigationMenuItem>

        ) : (
          <NavigationMenuItem>
          <Link href="/login" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle}>
              Login
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}