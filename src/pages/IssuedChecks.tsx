import { useState } from "react";
import { formatMAD, getStatusColor, cn } from "@/lib/utils";
import { MOCK_CHECKS } from "@/lib/mock-data";
import { Check } from "@/lib/types";
import { Search, Filter, Download, Plus, MoreHorizontal, Printer } from "lucide-react";
import { PrintModal } from "@/components/PrintModal";

export function IssuedChecks() {
  const [activeStatus, setActiveStatus] = useState<string>("Tous");
  const [printingCheck, setPrintingCheck] = useState<Check | null>(null);
  
  const checks = MOCK_CHECKS.filter(c => !c.isReceived);
  const filteredChecks = activeStatus === "Tous" ? checks : checks.filter(c => c.status === activeStatus);

  const statuses = ["Tous", "En Circulation", "En Retard", "Payé", "Annulé"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[18px] mb-0 font-bold text-slate-900 tracking-tight">Chèques/Effets Émis</h1>
          <p className="text-[12px] text-slate-500 m-0">Gérez vos paiements sortants.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-[6px] text-[12px] font-semibold hover:bg-slate-50 transition cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            Exporter
          </button>
          <button className="flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-[6px] text-[12px] font-semibold hover:bg-emerald-600 transition shadow-sm border-none cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            Nouveau Chèque Émis
          </button>
        </div>
      </div>

      {/* Analytics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-[12px] border border-slate-200 shadow-sm flex flex-col gap-1">
          <div className="text-[12px] font-medium text-slate-500">Total Émis</div>
          <div className="text-[18px] font-bold text-slate-900">{formatMAD(1500000)}</div>
        </div>
        <div className="bg-[#FEF3C7] p-4 rounded-[12px] border border-yellow-200 flex flex-col gap-1">
          <div className="text-[12px] font-medium text-yellow-800">En Circulation</div>
          <div className="text-[18px] font-bold text-yellow-900">{formatMAD(250000)}</div>
        </div>
        <div className="bg-[#FEE2E2] p-4 rounded-[12px] border border-red-200 flex flex-col gap-1">
          <div className="text-[12px] font-medium text-red-800">En Retard</div>
          <div className="text-[18px] font-bold text-red-900">{formatMAD(85000)}</div>
        </div>
        <div className="bg-[#D1FAE5] p-4 rounded-[12px] border border-green-200 flex flex-col gap-1">
          <div className="text-[12px] font-medium text-green-800">Payé</div>
          <div className="text-[18px] font-bold text-green-900">{formatMAD(1150000)}</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-[12px] border border-slate-200 flex flex-col gap-1">
          <div className="text-[12px] font-medium text-slate-600">Annulé</div>
          <div className="text-[18px] font-bold text-slate-900">{formatMAD(15000)}</div>
        </div>
      </div>

      <div className="bg-white rounded-[12px] border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {statuses.map(status => (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={cn(
                  "px-3 py-1 text-[12px] font-semibold rounded-[6px] whitespace-nowrap transition-colors cursor-pointer border-none",
                  activeStatus === status 
                    ? "bg-slate-900 text-white" 
                    : "bg-transparent text-slate-500 hover:bg-slate-100"
                )}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
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
                <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100">Type & Numéro</th>
                <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100">Bénéficiaire</th>
                <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100">Date Création</th>
                <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100">Date Échéance</th>
                <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100">Montant</th>
                <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100">Statut</th>
                <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChecks.map((check) => (
                <tr key={check.id} className="hover:bg-slate-50 border-b border-slate-50">
                  <td className="px-4 py-2.5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{check.number}</span>
                      <span className="text-[10px] text-slate-500">{check.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-slate-900">{check.partnerName}</span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{check.emissionDate}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn(
                      "font-semibold",
                      check.status === "En Retard" ? "text-red-600" : "text-slate-900"
                    )}>
                      {check.dueDate}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-bold text-slate-900">{formatMAD(check.amount)}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn("px-2 py-1 text-[10px] uppercase font-bold rounded-full", getStatusColor(check.status))}>
                      {check.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right flex items-center justify-end gap-1">
                    <button 
                      onClick={() => setPrintingCheck(check)}
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-[6px] bg-transparent border-none cursor-pointer transition-colors"
                      title="Imprimer"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-[6px] bg-transparent border-none cursor-pointer transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredChecks.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 border-b border-slate-50">
                    Aucun chèque trouvé pour ce statut.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="px-4 py-3 flex items-center justify-between text-[11px] text-slate-500 bg-white">
          <div>Affichage de 1 à {filteredChecks.length} sur {filteredChecks.length} entrées</div>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 border border-slate-200 rounded-[4px] hover:bg-slate-50 disabled:opacity-50 cursor-pointer bg-white">Précédent</button>
            <button className="px-2 py-1 border border-slate-200 rounded-[4px] hover:bg-slate-50 disabled:opacity-50 cursor-pointer bg-white">Suivant</button>
          </div>
        </div>
      </div>
      
      <PrintModal 
        check={printingCheck} 
        onClose={() => setPrintingCheck(null)} 
      />
    </div>
  );
}
