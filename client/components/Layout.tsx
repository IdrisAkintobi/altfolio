import { LayoutDashboard, LogOut, PieChart, Wallet, Briefcase, Users } from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";
import { Button } from "./ui/Button";
import { useAuth } from "../contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  
  // Extract first name from full name
  const firstName = user?.name?.split(' ')[0] || 'User';
  const userRole = user?.role || 'viewer';
  
  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Investments", icon: Wallet, path: "/investments" },
    { label: "Assets", icon: Briefcase, path: "/assets" },
    ...(userRole === 'admin' ? [{ label: "Users", icon: Users, path: "/users" }] : []),
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 flex flex-col bg-slate-900/50">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Altfolio
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="flex flex-col gap-1 mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Signed in as
            </span>
            <span className="text-sm font-medium text-white truncate">
              {firstName}
            </span>
            <span className="text-xs text-slate-500 capitalize">
              {userRole}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-950/30"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
};
