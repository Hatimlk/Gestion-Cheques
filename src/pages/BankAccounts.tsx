import { formatMAD } from "@/lib/utils";
import { useApp, COMPANY_NAME } from "@/lib/AppContext";
import { Plus, User, Info, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import { NewAccountModal } from "@/components/NewAccountModal";
import { NewCheckbookModal } from "@/components/NewCheckbookModal";

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

export function BankAccounts() {
  const { bankAccounts, checks, deleteBankAccount } = useApp();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isCheckbookModalOpen, setIsCheckbookModalOpen] = useState(false);

  const getAccountCounts = (accountId: string) => {
    const accountChecks = checks.filter(c => c.bankAccountId === accountId);
    return {
      nonPaid: accountChecks.filter(c => c.status === "En Circulation" || c.status === "En Retard" || c.status === "Déposé" || c.status === "Impayé"),
      paid: accountChecks.filter(c => c.status === "Payé"),
      cancelled: accountChecks.filter(c => c.status === "Annulé"),
    };
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[18px] mb-0 font-bold text-slate-900 tracking-tight">Comptes Bancaires</h1>
          <p className="text-[12px] text-slate-500 m-0">Gérez vos comptes bancaires et carnets.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsAccountModalOpen(true)} className="flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-[6px] text-[12px] font-semibold hover:bg-emerald-600 transition shadow-sm border-none cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            Nouveau Compte
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFA000] text-white flex items-center justify-center shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-[14px] uppercase m-0 leading-tight">{COMPANY_NAME}</h3>
              <div className="inline-flex items-center gap-1 bg-[#E1F0FF] text-[#0066FF] text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase mt-1">
                ADMINISTRATEUR <Info className="w-3 h-3" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-[6px] text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition bg-white cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter un Nouveau RIB
            </button>
          </div>
        </div>

        {bankAccounts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500">Aucun compte bancaire trouvé.</p>
            <button onClick={() => setIsAccountModalOpen(true)} className="mt-3 text-[13px] font-semibold text-primary hover:text-emerald-700 bg-transparent border-none cursor-pointer">
              Ajouter un compte
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] whitespace-nowrap border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100">Banque</th>
                  <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100">Carnet</th>
                  <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100">Non Payé</th>
                  <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100">Payé</th>
                  <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100">Annulé</th>
                  <th className="px-4 py-3 uppercase font-semibold text-[10px] text-slate-500 border-b-2 border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bankAccounts.map(account => {
                  const counts = getAccountCounts(account.id);
                  const logoPath = getBankLogo(account.bankName);
                  const cleanRib = account.rib.replace(/\s+/g, '');
                  const maskedRib = cleanRib.length >= 8 
                    ? `${cleanRib.substring(0, 4)}xxx${cleanRib.substring(cleanRib.length - 4)}`
                    : account.rib;

                  return (
                    <tr key={account.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden relative shadow-sm border border-slate-100">
                            {logoPath ? (
                              <img src={logoPath} alt={account.bankName} className="w-full h-full object-cover" />
                            ) : (
                              <>
                                <div className="absolute inset-0 bg-[#FF5B37]"></div>
                                <svg className="absolute w-full h-full text-black/80" viewBox="0 0 100 100" preserveAspectRatio="none">
                                  <path d="M0,50 L20,30 L40,60 L60,30 L80,60 L100,40 L100,100 L0,100 Z" fill="currentColor"/>
                                </svg>
                              </>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-[13px] uppercase leading-tight">{account.bankName}</span>
                            <span className="text-[12px] font-medium text-slate-400">{maskedRib}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setIsCheckbookModalOpen(true)} className="bg-primary text-white flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[11px] font-semibold hover:bg-emerald-600 transition border-none cursor-pointer">
                          <Plus className="w-3.5 h-3.5" /> Ajouter un Carnet
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#FFF4E5] text-[#FF9800] text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] min-w-[18px] text-center">{counts.nonPaid.length}</span>
                          <span className="font-bold text-[12px] text-slate-800">{formatMAD(counts.nonPaid.reduce((s, c) => s + c.amount, 0)).replace(/[a-zA-Z]/g, "").trim()}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#E6F8F0] text-[#00C853] text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] min-w-[18px] text-center">{counts.paid.length}</span>
                          <span className="font-bold text-[12px] text-slate-800">{formatMAD(counts.paid.reduce((s, c) => s + c.amount, 0)).replace(/[a-zA-Z]/g, "").trim()}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#FFEBEE] text-[#F44336] text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] min-w-[18px] text-center">{counts.cancelled.length}</span>
                          <span className="font-bold text-[12px] text-slate-800">{formatMAD(counts.cancelled.reduce((s, c) => s + c.amount, 0)).replace(/[a-zA-Z]/g, "").trim()}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-[6px] bg-transparent border-none cursor-pointer transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteBankAccount(account.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-[6px] bg-transparent border-none cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-3 flex items-center justify-between text-[11px] text-slate-500 bg-white border-t border-slate-100">
          <div>Affichage de 1 à {bankAccounts.length} sur {bankAccounts.length} entrées</div>
        </div>
      </div>

      <NewAccountModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} />
      <NewCheckbookModal isOpen={isCheckbookModalOpen} onClose={() => setIsCheckbookModalOpen(false)} />
    </div>
  );
}
