import {
  HomeIcon,
  LogOut,
  MessageCircle,
  Search,
  User,
  Users,
  CirclePlus,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store"; // Type-only import

const Sidebar = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.value);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `w-full flex gap-3 items-center p-4 rounded-xl transition-colors duration-200
    ${
      isActive
        ? "text-purple-800 bg-purple-100 border border-purple-200"
        : "text-gray-700 hover:text-purple-800 hover:bg-purple-50"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/landing", { replace: true });
  };

  // Default avatar in case user doesn't have a profile image
  const defaultAvatar = "/src/assets/sample_profile.jpg";

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Navigation Links */}
      <div className="flex-1 p-5 overflow-y-auto pt-4">
        <nav className="space-y-2">
          <NavLink to="/" className={navLinkClasses} end>
            <HomeIcon size={20} />
            <span className="font-medium">Feed</span>
          </NavLink>

          <NavLink to="/messages" className={navLinkClasses}>
            <MessageCircle size={20} />
            <span className="font-medium">Messages</span>
          </NavLink>

          <NavLink to="/connections" className={navLinkClasses}>
            <Users size={20} />
            <span className="font-medium">Connections</span>
          </NavLink>

          <NavLink to="/discover" className={navLinkClasses}>
            <Search size={20} />
            <span className="font-medium">Discover</span>
          </NavLink>

          <NavLink to="/profile" className={navLinkClasses}>
            <User size={20} />
            <span className="font-medium">Profile</span>
          </NavLink>
        </nav>

        <NavLink
          to="/post"
          className="text-white w-full mt-6 rounded-xl p-4 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center gap-2 font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <CirclePlus size={20} />
          Create Post
        </NavLink>
      </div>

      {/* User Profile Section */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-300">
            <img
              src={user?.profileimagelink || defaultAvatar}
              alt="User avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-gray-900 text-sm block truncate">
              {user?.username || "User"}
            </span>
            <span className="text-gray-500 text-xs block truncate">
              {user?.email || "user@example.com"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
