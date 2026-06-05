import { useState } from "react";
import { formatMAD, cn } from "@/lib/utils";
import { useApp } from "@/lib/AppContext";
import { Check } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import { 
  Search, Plus, Printer, Pencil, Eye, 
  FileText, RefreshCw, Bell, FileCheck, FileX,
  ChevronDown, ChevronLeft, ChevronRight 
} from "lucide-react";
import { NewCheckModal } from "@/components/NewCheckModal";

const getBankLogo = (bankName: string) => {
  const name = bankName.toLowerCase();
  if (name.includes('attijari') || name.includes('awb')) return '/logos-bank/Attijariwafa Bank.png';
  if (name.includes('africa') || name.includes('boa')) return '/logos-bank/Bank Of Africa.png';
  if (name.includes('populaire') || name.includes('bp') || name.includes('banque pop')) return '/logos-bank/Bp.jpeg';
  if (name.includes('saham')) return '/logos-bank/Saham Bank.png';
  if (name.includes('barid')) return '/logos-bank/baridbank.png';
  if (name.includes('bmci')) return '/logos-bank/bmci.jpeg';
  if (name.includes('cdm') || name.includes('crédit du maroc') || name.includes('credit du maroc')) return '/logos-bank/cdm.png';
  if (name.includes('agricole') || name.includes('cam')) return '/logos-bank/creditagricole.png';
  return null;
};

const maskRib = (rib: string) => {
  if (!rib) return "";
  const cleanRib = rib.replace(/\s+/g, '');
  return cleanRib.length >= 8 
    ? `${cleanRib.substring(0, 4)}xxx${cleanRib.substring(cleanRib.length - 4)}`
    : rib;
};

const getEcheanceBadge = (status: string) => {
  if (status === "En Retard") {
     return <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold"><Bell className="w-3 h-3"/> 2 J</span>;
  } else if (status === "Payé") {
     return <span className="inline-flex items-center gap-1 bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-bold"><FileCheck className="w-3 h-3"/> Payé</span>;
  } else {
     return <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-bold"><RefreshCw className="w-3 h-3"/> 1 M, 7 J</span>;
  }
};

export function IssuedChecks() {
  const { checks, bankAccounts, updateCheckStatus, deleteCheck } = useApp();
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState<string>("Tous");
  const [isNewCheckModalOpen, setIsNewCheckModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const emittedChecks = checks.filter(c => !c.isReceived);

  const checksEnCirculation = emittedChecks.filter(c => c.status === "En Circulation");
  const checksEnRetard = emittedChecks.filter(c => c.status === "En Retard");
  const checksPaye = emittedChecks.filter(c => c.status === "Payé");
  const checksAnnule = emittedChecks.filter(c => c.status === "Annulé");

  const filteredChecks = emittedChecks.filter(c => {
    const matchesStatus = activeStatus === "Tous" || c.status === activeStatus;
    const matchesSearch = c.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalEmitted = emittedChecks.reduce((s, c) => s + c.amount, 0);
  const totalEnCirculation = checksEnCirculation.reduce((s, c) => s + c.amount, 0);
  const totalEnRetard = checksEnRetard.reduce((s, c) => s + c.amount, 0);
  const totalPaye = checksPaye.reduce((s, c) => s + c.amount, 0);
  const totalAnnule = checksAnnule.reduce((s, c) => s + c.amount, 0);

  const statusOptions = ["En Circulation", "En Retard", "Déposé", "Impayé", "Payé", "Annulé"];

  const handlePrint = (check: Check) => {
    const account = bankAccounts.find(a => a.id === check.bankAccountId);
    const bankName = account?.bankName || "";
    const typeLabel = check.type === "Effet" ? "Effet" : "Chèque";
    navigate("/impression", {
      state: {
        bankType: bankName ? `${bankName} - ${typeLabel}` : undefined,
        amount: String(check.amount),
        payee: check.partnerName,
        date: check.emissionDate,
        dueDate: check.dueDate,
        checkNumber: check.number,
        type: check.type,
      }
    });
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[18px] mb-0 font-bold text-slate-900 tracking-tight">Chèques/Effets Émis</h1>
          <p className="text-[12px] text-slate-500 m-0">Gérez vos paiements sortants.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsNewCheckModalOpen(true)} className="flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-[6px] text-[12px] font-semibold hover:bg-emerald-600 transition shadow-sm border-none cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            Nouveau Chèque Émis
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch overflow-hidden">
        {/* Total */}
        <div className="flex-1 flex items-center gap-4 px-6 py-5 border-b md:border-b-0 md:border-r border-slate-100 min-w-[200px]">
          <div className="w-12 h-12 rounded-full border-[2px] border-cyan-100 bg-cyan-50 text-cyan-500 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-slate-800">Total</span>
            <span className="text-[11px] font-medium text-slate-500">{emittedChecks.length} Valeurs</span>
            <span className="text-[14px] font-bold text-slate-900 mt-0.5">{formatMAD(totalEmitted).replace('MAD', '').trim()} MAD</span>
          </div>
        </div>
        
        {/* En Circulation */}
        <div className="flex-1 flex items-center gap-4 px-6 py-5 border-b md:border-b-0 md:border-r border-slate-100 min-w-[200px]">
          <div className="w-12 h-12 rounded-full border-[2px] border-orange-100 bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-slate-800">En Circulation</span>
            <span className="text-[11px] font-medium text-slate-500">{checksEnCirculation.length} Valeurs</span>
            <span className="text-[14px] font-bold text-slate-900 mt-0.5">{formatMAD(totalEnCirculation).replace('MAD', '').trim()} MAD</span>
          </div>
        </div>

        {/* En Retard */}
        <div className="flex-1 flex items-center gap-4 px-6 py-5 border-b md:border-b-0 md:border-r border-slate-100 min-w-[200px]">
          <div className="w-12 h-12 rounded-full border-[2px] border-red-100 bg-red-50 text-red-500 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-slate-800">En Retard</span>
            <span className="text-[11px] font-medium text-slate-500">{checksEnRetard.length} Valeurs</span>
            <span className="text-[14px] font-bold text-slate-900 mt-0.5">{formatMAD(totalEnRetard).replace('MAD', '').trim()} MAD</span>
          </div>
        </div>

        {/* Payé */}
        <div className="flex-1 flex items-center gap-4 px-6 py-5 border-b md:border-b-0 md:border-r border-slate-100 min-w-[200px]">
          <div className="w-12 h-12 rounded-full border-[2px] border-green-100 bg-green-50 text-green-500 flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-slate-800">Payé</span>
            <span className="text-[11px] font-medium text-slate-500">{checksPaye.length} Valeurs</span>
            <span className="text-[14px] font-bold text-slate-900 mt-0.5">{formatMAD(totalPaye).replace('MAD', '').trim()} MAD</span>
          </div>
        </div>

        {/* Annulé */}
        <div className="flex-1 flex items-center gap-4 px-6 py-5 min-w-[200px]">
          <div className="w-12 h-12 rounded-full border-[2px] border-slate-200 bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
            <FileX className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-slate-800">Annulé</span>
            <span className="text-[11px] font-medium text-slate-500">{checksAnnule.length} Valeurs</span>
            <span className="text-[14px] font-bold text-slate-900 mt-0.5">{formatMAD(totalAnnule).replace('MAD', '').trim()} MAD</span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">


        {/* Filters */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-2">
            {["Tous", "Payé", "En Circulation", "En Retard", "Annulé"].map(status => (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all duration-200 border-none cursor-pointer ${
                  activeStatus === status ? "bg-white text-slate-900 shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  {status}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    status === "Tous" ? "bg-slate-900 text-white" :
                    status === "Payé" ? "bg-green-100 text-green-700" :
                    status === "En Circulation" ? "bg-orange-100 text-orange-700" :
                    status === "En Retard" ? "bg-red-100 text-red-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {status === "Tous" ? emittedChecks.length :
                     status === "Payé" ? checksPaye.length :
                     status === "En Circulation" ? checksEnCirculation.length :
                     status === "En Retard" ? checksEnRetard.length :
                     checksAnnule.length}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..." 
                className="w-full sm:w-[200px] pl-9 pr-4 py-1.5 border border-slate-200 rounded-[6px] text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20" 
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] whitespace-nowrap">
            <thead className="bg-[#F8FAFC] border-y border-slate-200">
              <tr>
                <th className="px-6 py-4 w-10">
                  <input type="checkbox" className="rounded-[4px] border-slate-300 w-4 h-4 cursor-pointer accent-primary" />
                </th>
                <th className="px-4 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Action</th>
                <th className="px-4 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Compte Bancaire</th>
                <th className="px-4 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Type/Numéro</th>
                <th className="px-4 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Bénéficiaire/Date d'Émission</th>
                <th className="px-4 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Date d'Échéance</th>
                <th className="px-4 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Montant/Facture</th>
                <th className="px-4 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Statut/Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredChecks.map((check) => {
                const account = bankAccounts.find(a => a.id === check.bankAccountId);
                const bankName = account?.bankName || "Inconnu";
                const rib = account?.rib || "";
                const logoPath = getBankLogo(bankName);

                return (
                  <tr key={check.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded-[4px] border-slate-300 w-4 h-4 cursor-pointer accent-primary" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Pencil className="w-4 h-4 text-slate-400 hover:text-slate-700 cursor-pointer" />
                        <Eye className="w-4 h-4 text-slate-400 hover:text-slate-700 cursor-pointer" />
                        <Printer className="w-4 h-4 text-slate-400 hover:text-slate-700 cursor-pointer" onClick={() => handlePrint(check)} />
                        <div className="w-5 h-5 rounded-full bg-[#FFB020] text-white flex items-center justify-center text-[10px] font-bold cursor-pointer">T</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-sm border border-slate-100 flex items-center justify-center">
                          {logoPath ? (
                            <img src={logoPath} alt={bankName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#FF5B37]"></div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-[#1E293B] text-[12px] leading-tight uppercase">{bankName}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-slate-400 font-semibold text-[11px]">{maskRib(rib)}</span>
                            <span className="w-3.5 h-1.5 bg-emerald-100 rounded-full flex items-center justify-center">
                              <div className="w-1.5 h-px bg-emerald-500"></div>
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={cn("px-2 py-0.5 rounded-[4px] text-[10px] font-bold text-white", check.type === 'Effet' ? 'bg-[#FF9800]' : 'bg-[#1E293B]')}>
                          {check.type}
                        </span>
                        <span className="font-bold text-slate-800 text-[11px]">{check.number}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-bold text-slate-800 text-[12px]">{check.partnerName}</span>
                        <span className="text-slate-500 font-medium text-[11px]">{check.emissionDate}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-start gap-1">
                        {getEcheanceBadge(check.status)}
                        <span className="text-slate-500 font-medium text-[11px]">{check.dueDate}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-bold text-slate-800 text-[13px]">{formatMAD(check.amount)}</span>
                        <span className="text-slate-500 text-[10px] font-medium flex items-center gap-0.5 uppercase cursor-pointer hover:text-slate-700">
                          service <ChevronDown className="w-3 h-3" />
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative inline-block">
                        <select
                          value={check.status}
                          onChange={(e) => updateCheckStatus(check.id, e.target.value as any)}
                          className={cn("px-3 py-1.5 pr-8 rounded-[6px] text-[11px] font-bold appearance-none cursor-pointer outline-none border-none", 
                            check.status === 'En Retard' ? 'bg-red-50 text-red-600' :
                            check.status === 'En Circulation' ? 'bg-orange-50 text-orange-600' :
                            check.status === 'Payé' ? 'bg-green-50 text-green-600' :
                            'bg-slate-100 text-slate-600'
                          )}
                        >
                          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className={cn("w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none",
                           check.status === 'En Retard' ? 'text-red-600' :
                           check.status === 'En Circulation' ? 'text-orange-600' :
                           check.status === 'Payé' ? 'text-green-600' :
                           'text-slate-600'
                        )} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredChecks.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    Aucun chèque/effet trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 flex items-center justify-between text-[11px] text-slate-500 bg-white border-t border-slate-100">
          <div>Affichage de 1 à {filteredChecks.length} sur {filteredChecks.length} entrées</div>
        </div>
      </div>

      <NewCheckModal isOpen={isNewCheckModalOpen} onClose={() => setIsNewCheckModalOpen(false)} />
    </div>
  );
}
