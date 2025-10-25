import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchUser } from "@/features/user/userSlice";
import API from "@/api/axios";
import Sidebar from "../sidebar";
import Header from "../header";
import Sponsor from "../sponsor";
import RecentChat from "../recentChat";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { initializeSocket } from "@/socket/socket";

const Layout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = useSelector((state: RootState) => state.user.value);

  useEffect(() => {
    if (user?._id) {
      initializeSocket(user._id);
    }
  }, [user?._id]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/landing", { replace: true });
        return;
      }

      try {
        const { data } = await API.get("/user/data");
        if (data.success) {
          dispatch(fetchUser() as any);
        } else {
          localStorage.removeItem("token");
          navigate("/landing", { replace: true });
        }
      } catch (error) {
        console.log("Auth check error:", error);
        localStorage.removeItem("token");
        navigate("/landing", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, dispatch]);

  // Close sidebar when clicking on overlay
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header - Always visible */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden pt-16">
        {" "}
        {/* pt-16 to account for fixed header height */}
        {/* Sidebar */}
        {/* Mobile: Hidden by default, shown when sidebarOpen is true */}
        {/* Desktop: Always visible */}
        <div
          className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 h-full
          lg:relative lg:z-auto lg:flex-shrink-0
          ${sidebarOpen ? "block" : "hidden"} 
          lg:block
        `}
        >
          <Sidebar />
        </div>
        {/* Main Content + Right Sidebar Container */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content - Single scrollable area */}
          <main className="flex-1 overflow-y-auto">
            <div className="min-h-full">
              <Outlet />
            </div>
          </main>

          {/* Right Sidebar - Sponsor & Recent Chat */}
          <div className="w-[500px] flex-shrink-0 h-full p-6 hidden xl:block overflow-y-auto">
            <div className="space-y-6">
              <Sponsor />
              {/* <RecentChat /> */}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar - Only show when sidebar is open on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-transparent  bg-opacity-50 z-30 lg:hidden"
          onClick={handleOverlayClick}
        />
      )}
    </div>
  );
};

export default Layout;
