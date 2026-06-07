import { X } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";

export type PartnerType = "Client" | "Fournisseur";

export interface Partner {
  id: number;
  type: PartnerType;
  name: string;
  contact: string;
  phone: string;
  balance: number;
}

interface NewPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (partner: Omit<Partner, "id">) => void;
  editPartner?: Partner | null;
}

export function NewPartnerModal({ isOpen, onClose, onSave, editPartner }: NewPartnerModalProps) {
  const [type, setType] = useState<PartnerType>("Client");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (editPartner) {
      setType(editPartner.type);
      setName(editPartner.name);
      setContact(editPartner.contact);
      setPhone(editPartner.phone);
      setBalance(editPartner.balance);
    } else {
      setType("Client");
      setName("");
      setContact("");
      setPhone("");
      setBalance(0);
    }
  }, [editPartner, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ type, name, contact, phone, balance });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[12px] shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-[16px] font-bold text-slate-900 m-0">{editPartner ? "Modifier Partenaire" : "Nouveau Partenaire"}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-[6px] hover:bg-slate-50 border-none bg-transparent cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1">Type de Partenaire</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value as PartnerType)} 
                className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                required
              >
                <option value="Client">Client</option>
                <option value="Fournisseur">Fournisseur</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1">Raison Sociale / Nom</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Entreprise Z" 
                className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Personne à contacter</label>
                <input 
                  type="text" 
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Ex: Hassan T." 
                  className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                  required 
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Téléphone</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: 0600000000" 
                  className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                  required 
                />
              </div>
            </div>
            {editPartner && (
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Solde Initial (MAD)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={balance}
                  onChange={(e) => setBalance(parseFloat(e.target.value))}
                  placeholder="0.00" 
                  className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                  required 
                />
              </div>
            )}
            
            {/* Footer */}
            <div className="pt-4 flex justify-end gap-3 mt-6 border-t border-slate-100">
              <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-[6px] hover:bg-slate-50 transition cursor-pointer">
                Annuler
              </button>
              <button type="submit" className="px-4 py-2 text-[13px] font-semibold text-white bg-primary rounded-[6px] hover:opacity-90 transition border-none cursor-pointer">
                {editPartner ? "Sauvegarder" : "Ajouter le partenaire"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
