import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Home,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/useMediaQuery";

const userNavItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
];

const adminNavItems = [
  { to: "/admin", icon: BarChart3, label: "Admin Overview" },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthContext();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-midnight-950">
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 transform border-r border-white/10 bg-midnight-900/95 backdrop-blur-xl transition-transform duration-300 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
          <button
            onClick={() => navigate("/")}
            className="font-serif text-xl font-bold gold-text"
          >
            MRG
          </button>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5 text-gray-400" />
            </button>
          )}
        </div>

        <nav className="mt-6 space-y-1 px-3">
          {/* User section */}
          <p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-widest text-gray-500">User</p>
          {userNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              onClick={() => isMobile && setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gold-500/10 text-gold-400 gold-border"
                    : "text-gray-400 hover:bg-white/5 hover:text-white",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}

          {/* Admin section */}
          <div className="pt-4">
            <p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-widest text-gray-500">Admin</p>
          </div>
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              onClick={() => isMobile && setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gold-500/10 text-gold-400 gold-border"
                    : "text-gray-400 hover:bg-white/5 hover:text-white",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}

          <div className="pt-4">
            <p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-widest text-gray-500">Navigation</p>
          </div>
          <NavLink
            to="/"
            onClick={() => isMobile && setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 transition-all duration-200 hover:bg-white/5 hover:text-white"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </NavLink>
        </nav>
      </aside>

      <div className="flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/10 bg-midnight-950/80 px-4 sm:px-6 backdrop-blur-xl">
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">
                {user?.name || "Guest"}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500/20 text-sm font-medium text-gold-400">
              {(user?.name?.charAt(0) || "G").toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
