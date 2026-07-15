import { useState } from "react";
import { Printer, Plus, Trash2, Send } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { formatMAD } from "@/lib/utils";
import { toCardinal } from "n2words/fr-FR";

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
      <div className="hidden print:block w-full">
        {lines.map((line, idx) => (
          <div key={line.id || idx} className="print-container bg-white text-black font-sans text-[14px]" style={{ width: '100%', maxWidth: '210mm', minHeight: '297mm', margin: '0 auto', position: 'relative', pageBreakAfter: idx < lines.length - 1 ? 'always' : 'auto', padding: '15mm 20mm', boxSizing: 'border-box' }}>
            
            <div className="flex justify-end mt-4 pr-4">
              <div className="w-[400px]">
                <div className="flex mb-1"><span className="min-w-[100px] font-medium">Banque:</span><span className="font-bold flex-1">{selectedAccount?.bankName}</span></div>
                <div className="flex mb-1"><span className="min-w-[100px] font-medium">Agence:</span><span className="flex-1">Bd Hassan II BP 246, Agadir</span></div>
                <div className="flex mb-1"><span className="min-w-[100px] font-medium">N° de Compte:</span><span className="flex-1">{selectedAccount?.rib}</span></div>
              </div>
            </div>

            <div className="mt-16 flex justify-end pr-8">
              <div className="text-right">
                Agadir, le <span>{new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="mt-12 flex">
              <div className="w-[100px] font-medium">Objet:</div>
              <div className="underline font-bold">Ordre de virement</div>
            </div>

            <div className="mt-12 space-y-6">
              <p>Monsieur,</p>
              
              <p>Nous vous prions de bien vouloir virer, par le débit de notre compte :</p>
              
              <div className="flex items-center">
                <div className="w-[120px] font-medium">la somme de :</div>
                <div className="border border-black font-bold px-4 py-2 min-w-[200px] text-right mr-3">
                  {formatMAD(line.amount || 0).replace('MAD', '').trim()}
                </div>
                <span className="flex-1">MAD ({toCardinal(line.amount || 0)} dhs)</span>
              </div>
              
              <div className="flex items-start pt-4">
                <div className="w-[120px] font-medium mt-2">en faveur de :</div>
                <div className="flex-1">
                  <div className="border border-black font-bold px-4 py-2 inline-block min-w-[350px] text-center mb-2 uppercase">
                    {line.beneficiary}
                  </div>
                  <div className="leading-relaxed">
                    <div className="font-medium">{line.bank?.split(' - ')[0]}</div>
                    {line.bank?.split(' - ')[1] && <div>{line.bank.split(' - ')[1]}</div>}
                    <div className="tracking-widest font-mono mt-1">{line.rib}</div>
                  </div>
                </div>
              </div>

              <div className="pt-8 space-y-2">
                <p>Nous vous remercions de votre collaboration et vous prions d'agréer, Monsieur,</p>
                <p>l'expression de nos sentiments distingués.</p>
              </div>
            </div>

            <div className="mt-16 flex justify-end pr-12">
              <div className="text-center">
                <div className="font-bold mb-8">Le Directeur Général</div>
                <div className="font-medium">Franck GUILLET</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media print {
          @page {
            margin: 0;
            size: A4;
          }
          html, body {
            background: white;
            color: black;
            margin: 0;
            padding: 0;
          }
          .print-container {
            width: 100%;
            margin: 0;
            padding: 20mm;
          }
        }
      `}</style>
    </div>
  );
}
