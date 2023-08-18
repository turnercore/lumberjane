import Logo from "./Logo";
import UserAvatar from "../client/UserAvatar";
import NavBar from "./NavBar";

type HeaderProps = {
  isDark: boolean;
};


export default function Header( {isDark}: HeaderProps) {
  return (
    <header className="bg-gray-500 bg-opacity-10 top-0 w-full h-[62px] flex justify-between items-center p-4">
      {/* <div>
        <Logo />
      </div> */}
      <NavBar />
      <div className='flex mt-1 '>
          <UserAvatar />
      </div>  
    </header>
  )
}
