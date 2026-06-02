import { useState } from "react";
import { formatMAD, cn } from "@/lib/utils";
import { MOCK_CHECKBOOKS } from "@/lib/mock-data";
import { Plus, Search, Filter, MoreHorizontal, BookCopy } from "lucide-react";

export function Checkbooks() {
  const [activeTab, setActiveTab] = useState<"Tous" | "Chèque" | "Effet">("Tous");

  const filteredCheckbooks = activeTab === "Tous" 
    ? MOCK_CHECKBOOKS 
    : MOCK_CHECKBOOKS.filter(cb => cb.type === activeTab);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[18px] mb-0 font-bold text-slate-900 tracking-tight">Les Carnets</h1>
          <p className="text-[12px] text-slate-500 m-0">Gérez votre inventaire de carnets de chèques et d'effets.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-[6px] text-[12px] font-semibold hover:bg-emerald-600 transition shadow-sm border-none cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            Nouveau Carnet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-[12px] border border-slate-200 shadow-sm flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="text-[12px] font-medium text-slate-500">Carnets Actifs</div>
            <BookCopy className="w-4 h-4 text-primary" />
          </div>
          <div className="text-[18px] font-bold text-slate-900">{MOCK_CHECKBOOKS.length}</div>
        </div>
        <div className="bg-white p-4 rounded-[12px] border border-slate-200 shadow-sm flex flex-col gap-1">
          <div className="text-[12px] font-medium text-slate-500">Total Chèques Restants</div>
          <div className="text-[18px] font-bold text-slate-900">
            {MOCK_CHECKBOOKS.filter(c => c.type === "Chèque").reduce((acc, curr) => acc + curr.remaining, 0)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-[12px] border border-slate-200 shadow-sm flex flex-col gap-1">
          <div className="text-[12px] font-medium text-slate-500">Total Effets Restants</div>
          <div className="text-[18px] font-bold text-slate-900">
            {MOCK_CHECKBOOKS.filter(c => c.type === "Effet").reduce((acc, curr) => acc + curr.remaining, 0)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[12px] border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-[6px]">
            {["Tous", "Chèque", "Effet"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all duration-200 border-none cursor-pointer",
                  activeTab === tab 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "bg-transparent text-slate-500 hover:text-slate-700"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher un carnet..." 
                className="w-full sm:w-[200px] pl-9 pr-4 py-1.5 border border-slate-200 rounded-[6px] text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <button className="p-1.5 border border-slate-200 rounded-[6px] text-slate-500 hover:bg-slate-50 cursor-pointer bg-white">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] whitespace-nowrap border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100">Banque</th>
                <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100">Type</th>
                <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100">Série</th>
                <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100">Date d'Création</th>
                <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100 text-center">Restants</th>
                <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100 text-center">Statut des Pièces</th>
                <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCheckbooks.map((checkbook) => (
                <tr key={checkbook.id} className="hover:bg-slate-50 border-b border-slate-50">
                  <td className="px-4 py-2.5">
                    <span className="font-bold text-slate-900">{checkbook.bankName}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn(
                      "px-2 py-1 text-[10px] font-bold rounded-[4px]",
                      checkbook.type === "Chèque" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                    )}>
                      {checkbook.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-col">
                      <span className="font-mono text-slate-700">{checkbook.startNumber}</span>
                      <span className="text-[10px] text-slate-400">à {checkbook.endNumber}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{checkbook.creationDate}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={cn(
                      "font-bold px-2 py-1 rounded-[4px]",
                      checkbook.remaining <= 10 ? "bg-orange-50 text-orange-700" : "bg-slate-100 text-slate-700"
                    )}>
                      {checkbook.remaining}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-center gap-2">
                       <span className="text-[10px] text-slate-500 font-medium" title="Non Payé">En Cours: <b className="text-slate-800">{checkbook.totals.nonPaid}</b></span>
                       <span className="text-[10px] text-slate-500 font-medium" title="Payé">Payé: <b className="text-green-600">{checkbook.totals.paid}</b></span>
                       <span className="text-[10px] text-slate-500 font-medium" title="Annulé">Annulé: <b className="text-slate-400">{checkbook.totals.cancelled}</b></span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button className="p-1 text-slate-400 hover:text-slate-600 rounded bg-transparent border-none cursor-pointer">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCheckbooks.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 border-b border-slate-50">
                    Aucun carnet trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-4 py-3 flex items-center justify-between text-[11px] text-slate-500 bg-white border-t border-slate-100">
          <div>Affichage de 1 à {filteredCheckbooks.length} sur {filteredCheckbooks.length} entrées</div>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 border border-slate-200 rounded-[4px] hover:bg-slate-50 disabled:opacity-50 cursor-pointer bg-white">Précédent</button>
            <button className="px-2 py-1 border border-slate-200 rounded-[4px] hover:bg-slate-50 disabled:opacity-50 cursor-pointer bg-white">Suivant</button>
          </div>
        </div>
      </div>
    </div>
  );
}
