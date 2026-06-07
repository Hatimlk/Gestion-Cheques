import { X } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { useApp } from "@/lib/AppContext";
import type { Check, CheckType } from "@/lib/types";

interface NewCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  editCheck?: Check | null;
}

export function NewCheckModal({ isOpen, onClose, editCheck }: NewCheckModalProps) {
  const { addCheck, updateCheck, bankAccounts, checkbooks } = useApp();
  const [docType, setDocType] = useState<CheckType>("Chèque");
  const [amount, setAmount] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [checkNumber, setCheckNumber] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [checkbookId, setCheckbookId] = useState("");
  const [emissionDate, setEmissionDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (editCheck) {
      setDocType(editCheck.type);
      setAmount(String(editCheck.amount));
      setBeneficiary(editCheck.partnerName);
      setCheckNumber(editCheck.number);
      setBankAccountId(editCheck.bankAccountId);
      setCheckbookId(editCheck.checkbookId || "");
      setEmissionDate(editCheck.emissionDate);
      setDueDate(editCheck.dueDate);
    } else {
      setDocType("Chèque");
      setAmount("");
      setBeneficiary("");
      setCheckNumber("");
      setBankAccountId("");
      setCheckbookId("");
      setEmissionDate("");
      setDueDate("");
    }
  }, [editCheck, isOpen]);

  if (!isOpen) return null;

  const isEditing = !!editCheck;

  const availableCheckbooks = checkbooks.filter(
    cb => cb.bankAccountId === bankAccountId && cb.type === docType && (isEditing ? true : cb.remaining > 0)
  );

  const handleBankAccountChange = (id: string) => {
    setBankAccountId(id);
    if (!isEditing) setCheckbookId("");
  };

  const handleDocTypeChange = (type: CheckType) => {
    setDocType(type);
    if (!isEditing) setCheckbookId("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount.replace(/,/g, "."));
    if (isNaN(num)) return;
    if (!bankAccounts.find(a => a.id === bankAccountId)) return;

    if (isEditing) {
      updateCheck(editCheck.id, {
        type: docType,
        number: checkNumber,
        partnerName: beneficiary,
        bankAccountId,
        emissionDate,
        dueDate,
        amount: num,
      });
    } else {
      addCheck({
        bankAccountId,
        checkbookId: checkbookId || undefined,
        type: docType,
        number: checkNumber,
        partnerId: "",
        partnerName: beneficiary,
        emissionDate,
        dueDate,
        amount: num,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[12px] shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-[16px] font-bold text-slate-900 m-0">
            {isEditing ? `Modifier ${editCheck.type} N°${editCheck.number}` : `Nouveau ${docType}`}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-[6px] hover:bg-slate-50 border-none bg-transparent cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Type de document</label>
                <select value={docType} onChange={(e) => handleDocTypeChange(e.target.value as CheckType)} className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
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
                  onChange={(e) => handleBankAccountChange(e.target.value)}
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

            {!isEditing && bankAccountId && (
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                  Carnet <span className="text-slate-400 font-normal">(optionnel)</span>
                </label>
                <select
                  value={checkbookId}
                  onChange={(e) => setCheckbookId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Sans carnet</option>
                  {availableCheckbooks.map(cb => (
                    <option key={cb.id} value={cb.id}>
                      {cb.type} N°{cb.startNumber}–{cb.endNumber} ({cb.remaining} restants)
                    </option>
                  ))}
                </select>
                {availableCheckbooks.length === 0 && (
                  <p className="text-[11px] text-orange-500 mt-1">Aucun carnet disponible pour ce compte et type.</p>
                )}
              </div>
            )}

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
              <button type="submit" className="px-4 py-2 text-[13px] font-semibold text-white bg-primary rounded-[6px] hover:opacity-90 transition border-none cursor-pointer">
                {isEditing ? "Enregistrer" : "Créer et Sauvegarder"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
