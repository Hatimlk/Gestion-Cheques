import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart,
  Wallet,
  Users,
  BookCopy,
  ArrowUpRight,
  Printer,
  CalendarDays,
  Building2,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/AppContext";

const NAV_ITEMS = [
  { name: "Tableau de Bord", path: "/", icon: BarChart },
  { name: "Comptes", path: "/comptes", icon: Wallet },
  { name: "Rôles & Permissions", path: "/roles", icon: Users },
  { name: "Les Carnets", path: "/carnets", icon: BookCopy },
  { name: "Chèques Émis", path: "/emis", icon: ArrowUpRight },
  { name: "Impression", path: "/impression", icon: Printer },
  { name: "Calendrier", path: "/calendrier", icon: CalendarDays },
  { name: "Partenaires", path: "/partenaires", icon: Building2 },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useApp();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="w-[240px] bg-slate-900 h-screen flex flex-col text-slate-300">
      <div className="p-6 flex items-center gap-[10px]">
        <span className="text-[22px]">🏦</span>
        <span className="text-[18px] font-extrabold tracking-tight text-primary">Gadimat<span className="text-white font-semibold ml-1">Chèques</span></span>
      </div>

      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-6">Menu Principal</div>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-[12px] px-6 py-[10px] text-[13px] font-medium transition-all duration-200",
                isActive 
                  ? "bg-slate-800 text-primary border-l-4 border-primary" 
                  : "text-slate-300 hover:bg-slate-800 hover:text-white border-l-4 border-transparent"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}

        <div className="border-t border-slate-700 mx-4 my-2" />

        <div className="px-6 py-2">
          <div className="text-[11px] text-slate-400 truncate">{currentUser?.name}</div>
          <div className="text-[10px] text-slate-500 truncate">{currentUser?.email}</div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-[12px] w-full px-6 py-[10px] text-[13px] font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all duration-200 border-none cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </nav>
    </div>
  );
}
