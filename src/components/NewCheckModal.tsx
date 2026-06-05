import { X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useApp } from "@/lib/AppContext";
import type { CheckType } from "@/lib/types";

interface NewCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewCheckModal({ isOpen, onClose }: NewCheckModalProps) {
  const { addCheck, bankAccounts, checkbooks } = useApp();
  const [docType, setDocType] = useState<CheckType>("Chèque");
  const [amount, setAmount] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [checkNumber, setCheckNumber] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [emissionDate, setEmissionDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount.replace(/,/g, "."));
    if (isNaN(num)) return;
    const account = bankAccounts.find(a => a.id === bankAccountId);
    if (!account) return;
    addCheck({
      bankAccountId,
      type: docType,
      number: checkNumber,
      partnerId: "",
      partnerName: beneficiary,
      emissionDate,
      dueDate,
      amount: num,
      isReceived: false,
    });
    setDocType("Chèque");
    setAmount("");
    setBeneficiary("");
    setCheckNumber("");
    setBankAccountId("");
    setEmissionDate("");
    setDueDate("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[12px] shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-[16px] font-bold text-slate-900 m-0">Nouveau {docType} Émis</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-[6px] hover:bg-slate-50 border-none bg-transparent cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Type de document</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value as CheckType)} className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="Chèque">Chèque</option>
                  <option value="Effet">Lettre de Change (Effet)</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Montant (MAD)</label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1">Bénéficiaire</label>
              <input
                type="text"
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                placeholder="Nom du partenaire"
                className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Numéro de {docType}</label>
                <input
                  type="text"
                  value={checkNumber}
                  onChange={(e) => setCheckNumber(e.target.value)}
                  placeholder="Ex: 123456"
                  className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Compte</label>
                <select
                  value={bankAccountId}
                  onChange={(e) => setBankAccountId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                >
                  <option value="">Sélectionner...</option>
                  {bankAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.bankName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Date d'émission</label>
                <input
                  type="date"
                  value={emissionDate}
                  onChange={(e) => setEmissionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Date d'échéance</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 mt-6 border-t border-slate-100">
              <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-[6px] hover:bg-slate-50 transition cursor-pointer">
                Annuler
              </button>
              <button type="submit" className="px-4 py-2 text-[13px] font-semibold text-white bg-primary rounded-[6px] hover:bg-emerald-600 transition border-none cursor-pointer">
                Créer et Sauvegarder
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
