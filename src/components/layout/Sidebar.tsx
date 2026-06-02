import { Link, useLocation } from "react-router-dom";
import { 
  BarChart, 
  Wallet, 
  Users, 
  BookCopy, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CalendarDays, 
  Building2, 
  MessageSquare,
  LogOut,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Tableau de Bord", path: "/", icon: BarChart },
  { name: "Comptes", path: "/comptes", icon: Wallet },
  { name: "Rôles & Permissions", path: "/roles", icon: Users },
  { name: "Les Carnets", path: "/carnets", icon: BookCopy },
  { name: "Chèques Émis", path: "/emis", icon: ArrowUpRight },
  { name: "Chèques Reçus", path: "/recus", icon: ArrowDownLeft },
  { name: "Calendrier", path: "/calendrier", icon: CalendarDays },
  { name: "Partenaires", path: "/partenaires", icon: Building2 },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-[240px] bg-slate-900 h-screen flex flex-col text-slate-300">
      <div className="p-6 flex items-center gap-[10px]">
        <span className="text-[22px]">🏦</span>
        <span className="text-[22px] font-extrabold tracking-tight text-primary">Lbanka</span>
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

        <div className="mt-8">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-6">Support & Paramètres</div>
          <Link
            to="/chat"
            className={cn(
              "flex items-center gap-[12px] px-6 py-[10px] text-[13px] font-medium transition-all duration-200",
              location.pathname === "/chat" ? "bg-slate-800 text-primary border-l-4 border-primary" : "text-slate-300 hover:bg-slate-800 hover:text-white border-l-4 border-transparent"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            Support Chat
            <span className="ml-auto w-2 h-2 bg-primary rounded-full"></span>
          </Link>
          <Link
            to="/billing"
            className={cn(
              "flex items-center gap-[12px] px-6 py-[10px] text-[13px] font-medium transition-all duration-200",
              location.pathname === "/billing" ? "bg-slate-800 text-primary border-l-4 border-primary" : "text-slate-300 hover:bg-slate-800 hover:text-white border-l-4 border-transparent"
            )}
          >
            <Settings className="w-4 h-4" />
            Abonnement
          </Link>
        </div>
      </nav>

      <div className="p-5 mt-auto border-t border-slate-800">
        <div className="text-[11px] text-slate-500 font-semibold mb-1">PLAN PREMIUM</div>
        <div className="text-[13px] text-white">249 MAD / mois</div>
      </div>
    </div>
  );
}
