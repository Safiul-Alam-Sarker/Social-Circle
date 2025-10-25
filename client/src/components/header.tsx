import { MenuIcon, X } from "lucide-react";
import Logo from "../assets/logo.svg";
import { NavLink } from "react-router-dom";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  return (
    <header className="bg-white backdrop-blur-sm  border-b border-gray-200 fixed left-0 top-0 z-50 flex w-full h-16 items-center">
      <div className="flex justify-between items-center w-full gap-2 px-4">
        <NavLink to="/" className="flex items-center">
          <div className="flex-1 text-left text-sm leading-tight">
            <img src={Logo} alt="logo" className="h-8 w-auto" />
          </div>
        </NavLink>

        {/* Show toggle button only on mobile and tablet */}
        <button
          className="text-gray-600 p-2 rounded-md hover:bg-gray-100 transition-colors lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
