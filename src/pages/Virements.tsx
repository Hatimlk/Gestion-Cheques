import { useState } from "react";
import { Printer, Plus, Trash2, Send } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { formatMAD } from "@/lib/utils";

interface VirementLine {
  id: string;
  beneficiary: string;
  bank: string;
  rib: string;
  amount: number;
}

export function Virements() {
  const { bankAccounts, partnerList } = useApp();
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [lines, setLines] = useState<VirementLine[]>([
    { id: Date.now().toString(), beneficiary: "", bank: "", rib: "", amount: 0 }
  ]);

  const selectedAccount = bankAccounts.find(a => a.id === selectedAccountId);

  const handleAddLine = () => {
    setLines([...lines, { id: Date.now().toString(), beneficiary: "", bank: "", rib: "", amount: 0 }]);
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length > 1) {
      setLines(lines.filter(l => l.id !== id));
    }
  };

  const handleLineChange = (id: string, field: keyof VirementLine, value: any) => {
    setLines(lines.map(l => {
      if (l.id === id) {
        const newLine = { ...l, [field]: value };
        
        // Auto-fill bank and rib if beneficiary is selected from partnerList
        if (field === "beneficiary") {
          const partner = partnerList.find(p => p.name === value);
          if (partner) {
            const contactStr = partner.contact || "";
            let bank = contactStr;
            if (contactStr.includes(' / ')) {
              bank = contactStr.split(' / ')[0];
            }
            newLine.bank = bank;
            newLine.rib = partner.phone || "";
          }
        }
        
        return newLine;
      }
      return l;
    }));
  };

  const totalAmount = lines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 print:hidden">
        <div>
          <h1 className="text-[18px] mb-0 font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Ordres de Virement
          </h1>
          <p className="text-[12px] text-slate-500 m-0">Générez et imprimez vos ordres de virement bancaire.</p>
        </div>
        <button
          onClick={handlePrint}
          disabled={!selectedAccount || lines.length === 0 || totalAmount === 0}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-[8px] text-[13px] font-semibold hover:bg-slate-800 transition shadow-sm border-none cursor-pointer disabled:opacity-50"
        >
          <Printer className="w-4 h-4" />
          Imprimer l'Ordre
        </button>
      </div>

      <div className="bg-white p-6 rounded-[12px] border border-slate-200 shadow-sm print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-[12px] font-semibold text-slate-700 mb-2">Compte à débiter</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-[8px] text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white cursor-pointer"
            >
              <option value="" disabled hidden>Sélectionner un compte...</option>
              {bankAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.bankName} - {account.rib}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-slate-700 mb-2">Date d'exécution</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-[8px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-slate-800 m-0">Bénéficiaires</h3>
            <button
              onClick={handleAddLine}
              className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:text-primary/80 bg-transparent border-none cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter une ligne
            </button>
          </div>

          <div className="space-y-3">
            {lines.map((line, index) => (
              <div key={line.id} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-[8px]">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <input
                      type="text"
                      list="partners-virement-list"
                      placeholder="Bénéficiaire"
                      value={line.beneficiary}
                      onChange={(e) => handleLineChange(line.id, "beneficiary", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <datalist id="partners-virement-list">
                      {partnerList.map(p => (
                        <option key={p.id} value={p.name} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Banque"
                      value={line.bank}
                      onChange={(e) => handleLineChange(line.id, "bank", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="N° de Compte (RIB)"
                      value={line.rib}
                      onChange={(e) => handleLineChange(line.id, "rib", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Montant"
                      value={line.amount || ""}
                      onChange={(e) => handleLineChange(line.id, "amount", parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
                {lines.length > 1 && (
                  <button
                    onClick={() => handleRemoveLine(line.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-[6px] transition bg-transparent border-none cursor-pointer mt-0.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <div className="bg-slate-100 px-4 py-2 rounded-[8px] flex items-center gap-4">
              <span className="text-[12px] font-semibold text-slate-500 uppercase">Total :</span>
              <span className="text-[16px] font-bold text-slate-900">{formatMAD(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Zone d'impression */}
      <div className="hidden print:block print-container bg-white" style={{ width: '100%', maxWidth: '210mm', minHeight: '297mm', margin: '0 auto' }}>
        <div className="mb-10 text-right">
          <p className="text-[14px] font-medium text-black m-0">Le {new Date(date).toLocaleDateString('fr-FR')}</p>
        </div>

        <div className="mb-10">
          <p className="text-[14px] font-bold text-black m-0">À l'attention de : {selectedAccount?.bankName}</p>
          <p className="text-[14px] text-black m-0 mt-1">Objet : Ordre de Virement</p>
        </div>

        <div className="mb-6">
          <p className="text-[14px] text-black leading-relaxed">
            Messieurs,<br /><br />
            Par le débit de notre compte N° <strong>{selectedAccount?.rib}</strong> tenu dans vos livres,
            nous vous prions de bien vouloir effectuer les virements suivants :
          </p>
        </div>

        <table className="w-full mb-8 border-collapse">
          <thead>
            <tr>
              <th className="border border-black px-4 py-2 text-left text-[12px] font-bold uppercase w-1/4">Bénéficiaire</th>
              <th className="border border-black px-4 py-2 text-left text-[12px] font-bold uppercase w-1/5">Banque</th>
              <th className="border border-black px-4 py-2 text-left text-[12px] font-bold uppercase w-1/3">N° de Compte (RIB)</th>
              <th className="border border-black px-4 py-2 text-right text-[12px] font-bold uppercase">Montant</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx}>
                <td className="border border-black px-4 py-2 text-[13px]">{line.beneficiary}</td>
                <td className="border border-black px-4 py-2 text-[13px]">{line.bank}</td>
                <td className="border border-black px-4 py-2 text-[13px] font-mono">{line.rib}</td>
                <td className="border border-black px-4 py-2 text-[13px] text-right font-medium">{formatMAD(line.amount || 0)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="border border-black px-4 py-2 text-right text-[13px] font-bold uppercase">
                Total
              </td>
              <td className="border border-black px-4 py-2 text-right text-[14px] font-bold">
                {formatMAD(totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="mb-20">
          <p className="text-[14px] text-black m-0">
            Dans l'attente de l'exécution de cet ordre, veuillez agréer, Messieurs, l'expression de nos salutations distinguées.
          </p>
        </div>

        <div className="text-right pr-20">
          <p className="text-[14px] font-bold text-black m-0">La Direction</p>
          {/* Espace pour signature et cachet */}
        </div>
      </div>

      <style>{`
        @media print {
          html, body {
            background: white;
            color: black;
          }
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20mm;
          }
        }
      `}</style>
    </div>
  );
}
