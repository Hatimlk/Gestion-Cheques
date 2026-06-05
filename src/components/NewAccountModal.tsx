import { X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useApp } from "@/lib/AppContext";

interface NewAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewAccountModal({ isOpen, onClose }: NewAccountModalProps) {
  const { addBankAccount } = useApp();
  const [bankName, setBankName] = useState("");
  const [rib, setRib] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    addBankAccount({ bankName, rib });
    setBankName("");
    setRib("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[12px] shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-[16px] font-bold text-slate-900 m-0">Nouveau Compte Bancaire</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-[6px] hover:bg-slate-50 border-none bg-transparent cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1">Nom de la Banque</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="ex: Banque Populaire"
                className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1">RIB (24 chiffres)</label>
              <input
                type="text"
                value={rib}
                onChange={(e) => setRib(e.target.value)}
                placeholder="ex: 0000 0000 0000 0000 0000 0000"
                className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                required
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 mt-6">
              <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-[6px] hover:bg-slate-50 transition cursor-pointer">
                Annuler
              </button>
              <button type="submit" className="px-4 py-2 text-[13px] font-semibold text-white bg-primary rounded-[6px] hover:bg-emerald-600 transition border-none cursor-pointer">
                Créer le compte
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
