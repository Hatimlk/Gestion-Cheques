import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Printer, Save, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { amountToFrench } from "@/lib/numberToLetters";
import { useApp } from "@/lib/AppContext";

type ElementId = 'amountLetters' | 'amountNumbers' | 'payee' | 'place' | 'date' | 'dueDate' | 'cause';

interface Position {
  x: number;
  y: number;
}

const DEFAULT_CHEQUE_POSITIONS: Record<ElementId, Position> = {
  amountLetters: { x: 220, y: 100 },
  amountNumbers: { x: 630, y: 55 },
  payee: { x: 280, y: 160 },
  place: { x: 380, y: 210 },
  date: { x: 600, y: 210 },
  dueDate: { x: 600, y: 30 },
  cause: { x: 120, y: 190 },
};

const DEFAULT_EFFET_POSITIONS: Record<ElementId, Position> = {
  amountLetters: { x: 550, y: 200 },
  amountNumbers: { x: 570, y: 150 },
  payee: { x: 350, y: 70 },
  place: { x: 280, y: 110 },
  date: { x: 430, y: 110 },
  dueDate: { x: 570, y: 110 },
  cause: { x: 350, y: 150 },
};

const BANKS = [
  { name: "ATTIJARIWAFA BANK", chequeFile: "ATTIJARIWAFA BANK.png", effetFile: "ATTIJARIWAFA BANK.png" },
  { name: "BANK OF AFRICA", chequeFile: "BANK OF AFRICA.png", effetFile: "BANK OF AFRICA.png" },
  { name: "BMCI", chequeFile: "BMCI.png", effetFile: "BMCI.png" },
  { name: "BANQUE POPULAIRE", chequeFile: "BP.png", effetFile: "BP.png" },
  { name: "CIH BANK", chequeFile: "CIH.png", effetFile: "CIH.png" },
  { name: "CREDIT DU MAROC", chequeFile: "CREDIT DU MAROC.png", effetFile: "CREDIT MAROC.png" },
  { name: "CREDIT AGRICOLE", chequeFile: "CREDIT AGRICOLE.png", effetFile: "CREDIT AGRICOLE.png" },
  { name: "AL BARID BANK", chequeFile: "BARID BANK.png", effetFile: "BARID BANK.png" },
  { name: "SOCIETE GENERALE", chequeFile: "SOCIETE GENERALE.png", effetFile: "SOCIETE GENERALE.png" }
];

export function PrintModule() {
  const location = useLocation();
  const { addCheck, bankAccounts } = useApp();

  const [bankType, setBankType] = useState("BANQUE POPULAIRE - Chèque");
  const [amount, setAmount] = useState("");
  const [amountLetters, setAmountLetters] = useState("");
  const [payee, setPayee] = useState("");
  const [place, setPlace] = useState("Agadir");
  const [date, setDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [cause, setCause] = useState("");
  const [checkType, setCheckType] = useState("Chèque normal");

  const [positions, setPositions] = useState<Record<ElementId, Position>>(DEFAULT_CHEQUE_POSITIONS);

  const isEffet = bankType.includes("- Effet");
  const [isFromExisting, setIsFromExisting] = useState(false);

  useEffect(() => {
    const state = location.state as Record<string, string> | null;
    if (state) {
      if (state.checkNumber) setIsFromExisting(true);
      if (state.bankType) setBankType(state.bankType);
      if (state.amount) setAmount(state.amount);
      if (state.payee) setPayee(state.payee);
      if (state.date) setDate(state.date);
      if (state.dueDate) setDueDate(state.dueDate);
      if (state.type === "Effet" && state.bankType) {
        setBankType(state.bankType);
      }
    }
  }, [location.state]);

  useEffect(() => {
    const storageKey = isEffet ? "effetPositions" : "checkPositions";
    const defaultPos = isEffet ? DEFAULT_EFFET_POSITIONS : DEFAULT_CHEQUE_POSITIONS;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPositions({ ...defaultPos, ...parsed });
      } catch (e) {
        console.error("Error parsing saved positions", e);
        setPositions(defaultPos);
      }
    } else {
      setPositions(defaultPos);
    }
  }, [isEffet]);

  useEffect(() => {
    const num = parseFloat(amount.replace(/ /g, "").replace(/,/g, "."));
    if (!isNaN(num) && num >= 0) {
      setAmountLetters(amountToFrench(num));
    } else if (amount === "") {
      setAmountLetters("");
    }
  }, [amount]);

  const handleDragEnd = (id: ElementId, info: any) => {
    setPositions(prev => ({
      ...prev,
      [id]: {
        x: prev[id].x + info.offset.x,
        y: prev[id].y + info.offset.y
      }
    }));
  };

  const savePositions = () => {
    const storageKey = isEffet ? "effetPositions" : "checkPositions";
    localStorage.setItem(storageKey, JSON.stringify(positions));
    alert("Positions enregistrées avec succès !");
  };

  const resetPositions = () => {
    const defaultPos = isEffet ? DEFAULT_EFFET_POSITIONS : DEFAULT_CHEQUE_POSITIONS;
    const storageKey = isEffet ? "effetPositions" : "checkPositions";
    setPositions(defaultPos);
    localStorage.removeItem(storageKey);
  };

  const handlePrint = () => {
    window.print();

    if (!isFromExisting) {
      const bankName = bankType.split(" - ")[0];
      const type = bankType.includes("- Effet") ? "Effet" : "Chèque";
      
      let account = bankAccounts.find(a => a.bankName.toUpperCase() === bankName.toUpperCase());
      let bankAccountId = account ? account.id : (bankAccounts[0]?.id || "b1");

      const parsedAmount = parseFloat(amount.replace(/ /g, "").replace(/,/g, ".")) || 0;

      addCheck({
        bankAccountId,
        type: type as "Chèque" | "Effet",
        number: `IMP-${Date.now().toString().slice(-4)}`,
        partnerId: `p_${Date.now()}`,
        partnerName: payee || "Inconnu",
        emissionDate: date || new Date().toISOString().split("T")[0],
        dueDate: type === "Effet" ? (dueDate || new Date().toISOString().split("T")[0]) : (date || new Date().toISOString().split("T")[0]),
        amount: parsedAmount,
        note: "Reçu",
      });
      setIsFromExisting(true);
    }
  };

  const getFormattedAmount = () => {
    if (!amount) return "Montant";
    const num = parseFloat(amount.replace(/ /g, "").replace(/,/g, "."));
    if (isNaN(num)) return `#${amount}#`;
    const parts = num.toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `#${parts.join(".")}#`;
  };

  const elements = [
    { id: 'amountLetters' as ElementId, text: amountLetters || "Montant en lettres", className: `font-bold uppercase text-[13px] leading-tight ${isEffet ? 'w-[220px] text-center' : 'w-[400px]'}` },
    { id: 'amountNumbers' as ElementId, text: getFormattedAmount(), className: "font-bold text-[17px] tracking-wider" },
    { id: 'payee' as ElementId, text: payee || "Nom du bénéficiaire", className: "font-bold uppercase text-[14px]" },
    { id: 'place' as ElementId, text: place || "Ville", className: "font-bold uppercase text-[14px]" },
    { id: 'date' as ElementId, text: date || "Date", className: "font-bold text-[14px]" },
  ];

  if (isEffet) {
    elements.push({ id: 'dueDate' as ElementId, text: dueDate || "Date d'échéance", className: "font-medium" });
    elements.push({ id: 'cause' as ElementId, text: cause || "La cause", className: "font-medium text-[11px]" });
  }

  const selectedBankObj = BANKS.find(b => bankType.toLowerCase().startsWith(b.name.toLowerCase()));
  let bgImage = '';
  if (selectedBankObj) {
    if (isEffet && selectedBankObj.effetFile) {
      bgImage = `/effet/${selectedBankObj.effetFile}`;
    } else if (!isEffet && selectedBankObj.chequeFile) {
      bgImage = `/Checks/${selectedBankObj.chequeFile}`;
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 print:hidden">
        <div>
          <h1 className="text-[18px] mb-0 font-bold text-slate-900 tracking-tight">Impression</h1>
          <p className="text-[12px] text-slate-500 m-0">Ajustez les positions et imprimez vos chèques ou effets.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-[12px] border border-slate-200 shadow-sm print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1">
              🏦 La banque
            </label>
            <select
              value={bankType}
              onChange={(e) => setBankType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-primary/10 text-primary border-primary/20 font-semibold"
            >
              <optgroup label="Chèques">
                {BANKS.filter(b => b.chequeFile).map(b => (
                  <option key={`${b.name}-cheque`} value={`${b.name} - Chèque`}>{b.name} - Chèque</option>
                ))}
              </optgroup>
              <optgroup label="Effets">
                {BANKS.filter(b => b.effetFile).map(b => (
                  <option key={`${b.name}-effet`} value={`${b.name} - Effet`}>{b.name} - Effet</option>
                ))}
              </optgroup>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1">
              $ Montant
            </label>
            <input
              type="text"
              placeholder="Montant"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1">
              👤 A l'ordre de
            </label>
            <input
              type="text"
              placeholder="Bénéficiaire"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-blue-50/50"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1">
              📍 Fait à
            </label>
            <input
              type="text"
              placeholder="Ville"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-blue-50/50"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1">
              📅 Date
            </label>
            <input
              type="text"
              placeholder="JJ/MM/AAAA"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-blue-50/50"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1">
              ≡ Options
            </label>
            <select
              value={checkType}
              onChange={(e) => setCheckType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-primary/10 text-primary border-primary/20"
            >
              <option value="Chèque normal">Chèque normal</option>
              <option value="Chèque barré">Chèque barré</option>
            </select>
          </div>
        </div>

        {isEffet && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1">
                📅 Date d'échéance
              </label>
              <input
                type="text"
                placeholder="JJ/MM/AAAA"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1">
                ℹ La cause
              </label>
              <input
                type="text"
                placeholder="Ex: Facture N°..."
                value={cause}
                onChange={(e) => setCause(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-6 overflow-x-auto pb-8 print:p-0 print:m-0 print:overflow-visible">

        <div
          id="printable-check"
          className="relative bg-[#FDFBF2] border border-slate-300 shadow-md print:shadow-none print:border-none rounded-[4px] overflow-hidden select-none print:absolute print:left-0 print:top-0 print:m-0 print:bg-transparent"
          style={{ width: '800px', height: '350px' }}
        >
          {bgImage && (
            <img
              src={bgImage}
              alt="Background"
              className="absolute inset-0 w-full h-full object-fill pointer-events-none print:hidden opacity-90"
            />
          )}



          {elements.map((el) => (
            <motion.div
              key={el.id}
              drag
              dragMomentum={false}
              onDragEnd={(e, info) => handleDragEnd(el.id, info)}
              initial={{ x: positions[el.id].x, y: positions[el.id].y }}
              animate={{ x: positions[el.id].x, y: positions[el.id].y }}
              className={`absolute cursor-move print:cursor-default text-slate-800 ${el.id === 'amountLetters' ? 'whitespace-normal' : 'whitespace-nowrap'} px-2 py-1 rounded border border-transparent hover:border-blue-400 hover:bg-blue-50/50 print:border-none print:bg-transparent print:p-0 ${el.className}`}
              style={{ x: positions[el.id].x, y: positions[el.id].y }}
            >
              {el.text}
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-4 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-[8px] text-[14px] font-semibold hover:bg-slate-800 transition shadow-sm border-none cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
          <button
            onClick={resetPositions}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-[8px] text-[13px] font-semibold hover:bg-slate-50 transition shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser les positions
          </button>
          <button
            onClick={savePositions}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-[8px] text-[13px] font-semibold hover:opacity-90 transition shadow-sm border-none cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Enregistrer les positions
          </button>
        </div>

      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-check, #printable-check * {
            visibility: visible;
          }
          #printable-check {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
          }
          @page {
            margin: 0;
            size: auto;
          }
        }
      `}</style>
    </div>
  );
}
