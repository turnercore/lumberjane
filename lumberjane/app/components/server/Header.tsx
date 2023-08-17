"use client";
import Logo from "../client/Logo";
import UserAvatar from "./UserAvatar";

type HeaderProps = {
  isDark: boolean;
};


export default function Header( {isDark}: HeaderProps) {
  return (
    <header className="bg-gray-100 top-0 w-full h-[62px] flex justify-between items-center p-4">
      <div>
        <Logo />
      </div>
      <div className='flex mt-1 '>
          <UserAvatar />
      </div>  
    </header>
  )
}
