import { Link, useLocation } from "react-router-dom";
import {
  Users,
  Printer,
  CalendarDays,
  LayoutDashboard,
  Briefcase,
  UserCog,
  FileEdit,
  FileUp,
  BookOpen,
  FileCheck,
  Clock,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/AppContext";

const NAV_GROUPS = [
  {
    title: "TABLEAU DE BORD",
    items: [
      { name: "Tableau De Bord", path: "/", icon: LayoutDashboard },
      { name: "Comptes", path: "/comptes", icon: Briefcase },
      { name: "Rôles", path: "/roles", icon: UserCog, hasInfo: true },
    ]
  },
  {
    title: "CHÈQUES ET EFFETS",
    items: [
      { name: "Les Carnets", path: "/carnets", icon: FileEdit },
      { name: "Émis", path: "/emis", icon: FileUp, hasInfo: true },
      { name: "Réglés", path: "/regles", icon: FileCheck },
      { name: "Instances", path: "/instances", icon: Clock },
      { name: "Calendrier", path: "/calendrier", icon: CalendarDays },
      { name: "Les Clients", path: "/partenaires", icon: Users },
      { name: "Impression", path: "/impression", icon: Printer },
    ]
  },
  {
    title: "AIDE",
    items: [
      { name: "Guide d'utilisation", path: "/guide", icon: BookOpen }
    ]
  }
];

export function Sidebar() {
  const location = useLocation();
  const { currentUser, logout } = useApp();

  return (
    <div className="w-[240px] bg-slate-900 h-screen flex flex-col text-slate-300">
      <div className="p-6 flex items-center gap-[10px]">
        <span className="text-[22px]">🏦</span>
        <span className="text-[18px] font-extrabold tracking-tight text-primary">Gadimat<span className="text-white font-semibold ml-1">Chèques</span></span>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto hide-scrollbar">
        {NAV_GROUPS.map((group, groupIdx) => (
          <div key={groupIdx} className={groupIdx > 0 ? "mt-6" : ""}>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-8">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                if (item.path === "/roles" && currentUser?.role !== "Administrateur") {
                  return null;
                }
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    data-tour={item.name}
                    className={cn(
                      "flex items-center gap-[14px] px-4 py-3 mx-4 rounded-[12px] text-[13px] font-bold transition-all duration-200",
                      isActive 
                        ? "bg-[#1e293b] text-blue-500" 
                        : "text-slate-300 hover:text-slate-200 hover:bg-[#1e293b]/50"
                    )}
                  >
                    <div className="relative flex items-center justify-center">
                      <item.icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 2} />
                      {item.hasInfo && (
                        <div className="absolute -top-1.5 -left-2 w-3.5 h-3.5 bg-slate-400 rounded-full flex items-center justify-center text-[#0f172a] text-[9px] font-bold border-2 border-[#0f172a]">
                          i
                        </div>
                      )}
                    </div>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div className="border-t border-slate-700 mx-4 my-2" />

        <div className="px-6 py-2 tour-user-profile flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-[11px] text-slate-400 truncate">{currentUser?.name}</div>
            <div className="text-[10px] text-slate-500 truncate">{currentUser?.email}</div>
          </div>
          <button 
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-[#1e293b] rounded-md transition-colors"
            title="Se déconnecter"
          >
            <LogOut className="w-[15px] h-[15px]" strokeWidth={2.5} />
          </button>
        </div>

      </nav>
    </div>
  );
}
