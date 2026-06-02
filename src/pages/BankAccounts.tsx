import { formatMAD } from "@/lib/utils";
import { MOCK_BANK_ACCOUNTS } from "@/lib/mock-data";
import { Plus, MoreHorizontal, Building2, CreditCard, BookCopy } from "lucide-react";

export function BankAccounts() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[18px] mb-0 font-bold text-slate-900 tracking-tight">Comptes Bancaires</h1>
          <p className="text-[12px] text-slate-500 mt-1 m-0">Gérez les comptes de vos sociétés.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-[6px] text-[12px] font-semibold hover:bg-emerald-600 transition shadow-sm border-none cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          Nouveau Compte
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_BANK_ACCOUNTS.map((account) => (
          <div key={account.id} className="bg-white rounded-[12px] border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-primary/50 hover:shadow transition-all">
            <div className="p-4 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[8px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-[14px] m-0">{account.bankName}</h3>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 mt-0.5">
                    <CreditCard className="w-3 h-3" />
                    {account.rib}
                  </div>
                </div>
              </div>
              <button className="p-1 text-slate-400 hover:text-slate-600 rounded bg-transparent border-none cursor-pointer">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-semibold bg-slate-50 px-2 py-1 rounded-[6px] border border-slate-100">
                  <BookCopy className="w-3.5 h-3.5 text-primary" />
                  {account.checkbooksCount} Carnets Actifs
                </div>
              </div>

              <div className="space-y-2 mt-auto">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-slate-500">Non Payé (Circulation + Retard)</span>
                  <span className="font-semibold text-slate-900">{formatMAD(account.totals.nonPaid)}</span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-slate-500">Payé Total</span>
                  <span className="font-semibold text-primary">{formatMAD(account.totals.paid)}</span>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 bg-slate-50 flex gap-2">
              <button className="flex-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 py-1.5 rounded-[6px] transition-colors cursor-pointer">
                Nouveau Carnet
              </button>
              <button className="flex-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 py-1.5 rounded-[6px] transition-colors cursor-pointer">
                Historique
              </button>
            </div>
          </div>
        ))}

        <button className="bg-slate-50/50 rounded-[12px] border-2 border-dashed border-slate-300 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center text-slate-500 hover:text-primary p-8 min-h-[250px] cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-3 shadow-sm">
            <Plus className="w-5 h-5" />
          </div>
          <span className="font-semibold text-[12px]">Ajouter un Compte Bancaire</span>
        </button>
      </div>
    </div>
  );
}
