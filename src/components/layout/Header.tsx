import { Bell, Search } from "lucide-react";
import { COMPANY_NAME } from "@/lib/AppContext";
import { useState, type FormEvent } from "react";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;
    alert("Aucun résultat trouvé pour votre recherche.");
  };

  return (
    <header className="h-[60px] border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <form onSubmit={handleSearch} className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher (RIB, N°, Partenaire)..."
            className="w-full pl-9 pr-4 py-[6px] bg-slate-50 border border-slate-200 rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </form>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-[6px] h-[6px] bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-5 border-l border-slate-200 text-[13px] font-semibold bg-slate-50 py-1.5 px-3 rounded-[6px]">
          <div className="w-[24px] h-[24px] rounded-full bg-primary text-white flex items-center justify-center font-bold text-[11px]">
            G
          </div>
          <span className="text-slate-700">{COMPANY_NAME}</span>
        </div>
      </div>
    </header>
  );
}
