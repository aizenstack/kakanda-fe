import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/composables/SideBarWidget";
import Topbar from "../components/composables/TopBarWidget";
import { authService } from "../services/authService";

export default function Layout() {
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getUser();
        setUser(response.data.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Topbar 
        onToggleSidebar={() => setIsSidebarMinimized(prev => !prev)} 
        isSidebarMinimized={isSidebarMinimized} 
        user={user}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isMinimized={isSidebarMinimized} />

        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

