import { Check } from "@/lib/types";
import { formatMAD } from "@/lib/utils";
import { Printer, X } from "lucide-react";

interface PrintModalProps {
  check: Check | null;
  onClose: () => void;
}

export function PrintModal({ check, onClose }: PrintModalProps) {
  if (!check) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[12px] shadow-xl w-full max-w-3xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-[16px] font-bold text-slate-900 m-0">Aperçu avant impression</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-[6px] hover:bg-slate-50 border-none bg-transparent cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 bg-slate-50 flex-1 flex justify-center items-center overflow-auto min-h-[400px]">
          {check.type === "Chèque" ? (
             <div id="print-area" className="w-[600px] h-[280px] bg-white shadow-sm relative p-6 font-sans flex flex-col justify-between overflow-hidden" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px', border: '1px dashed #cbd5e1' }}>
                <div className="flex justify-between items-start">
                  <div className="w-1/3">
                    <div className="font-bold text-[14px] text-slate-800 border-b-2 border-slate-800 pb-1 mb-1 inline-block uppercase">Banque de détails</div>
                    <div className="text-[10px] text-slate-500">Agence Centrale</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[12px] font-semibold text-slate-600">BP</span>
                       <div className="border border-slate-800 px-4 py-1.5 font-bold text-[16px] min-w-[150px] text-center bg-white shadow-sm">
                         {formatMAD(check.amount)}
                       </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 my-auto mt-6">
                   <div className="flex items-end gap-2">
                     <span className="text-[13px] font-medium text-slate-700 whitespace-nowrap">Payez contre ce chèque la somme de</span>
                     <div className="border-b border-dotted border-slate-400 flex-1 pb-1 font-bold text-[14px]">
                       *** {check.amount.toLocaleString('fr-FR')} Dirhams ***
                     </div>
                   </div>
                   <div className="flex items-end gap-2">
                     <span className="text-[13px] font-medium text-slate-700 whitespace-nowrap">À l'ordre de</span>
                     <div className="border-b border-dotted border-slate-400 flex-1 pb-1 font-bold text-[14px]">
                       {check.partnerName}
                     </div>
                   </div>
                </div>

                <div className="flex justify-between items-end mt-4">
                  <div className="text-[10px] text-slate-400 font-mono tracking-widest">
                    N° {check.number}
                  </div>
                  <div className="flex flex-col gap-3 w-1/2">
                    <div className="flex items-end gap-2">
                      <span className="text-[13px] font-medium text-slate-700 whitespace-nowrap">À</span>
                      <div className="border-b border-dotted border-slate-400 flex-1 pb-1 font-bold text-[13px] text-center">Casablanca</div>
                      <span className="text-[13px] font-medium text-slate-700 whitespace-nowrap">Le</span>
                      <div className="border-b border-dotted border-slate-400 flex-1 pb-1 font-bold text-[13px] text-center">{check.emissionDate.split('-').reverse().join('/')}</div>
                    </div>
                    <div className="h-16 border border-slate-200 relative bg-slate-50/50">
                      <span className="absolute top-1 left-2 text-[10px] text-slate-400">Signature</span>
                    </div>
                  </div>
                </div>
             </div>
          ) : (
             <div id="print-area" className="w-[600px] h-[300px] bg-white shadow-sm relative p-6 font-sans flex flex-col justify-between" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px', border: '1px dashed #cbd5e1' }}>
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-2 mb-4">
                  <div className="font-bold text-[16px] text-slate-800 uppercase tracking-wider">Lettre de Change</div>
                  <div className="flex items-center gap-2">
                     <span className="text-[12px] font-semibold text-slate-600">B.P.F</span>
                     <div className="border border-slate-800 px-4 py-1.5 font-bold text-[16px] min-w-[150px] text-center bg-white shadow-sm">
                       {formatMAD(check.amount)}
                     </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-slate-600">Lieu de création:</span>
                    <span className="font-bold text-[13px] border-b border-dotted border-slate-400 pb-0.5">Casablanca</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-slate-600">Date de création:</span>
                    <span className="font-bold text-[13px] border-b border-dotted border-slate-400 pb-0.5">{check.emissionDate.split('-').reverse().join('/')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-slate-600">Échéance:</span>
                    <span className="font-bold text-[13px] border-b border-dotted border-slate-400 pb-0.5">{check.dueDate.split('-').reverse().join('/')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[13px] font-medium text-slate-700">Veuillez payer contre cette lettre de change à l'ordre de:</span>
                  <span className="font-bold text-[14px] border-b border-dotted border-slate-400 pb-0.5 flex-1">{check.partnerName}</span>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[13px] font-medium text-slate-700">La somme de:</span>
                  <span className="font-bold text-[14px] border-b border-dotted border-slate-400 pb-0.5 flex-1">*** {check.amount.toLocaleString('fr-FR')} Dirhams ***</span>
                </div>

                <div className="flex justify-between w-full mt-auto">
                   <div className="w-[45%] border border-slate-300 p-2 min-h-[80px] bg-slate-50/50">
                      <div className="text-[10px] text-slate-500 font-semibold mb-1 uppercase">Tiré (Acceptation ou Aval)</div>
                   </div>
                   <div className="w-[45%] border border-slate-300 p-2 min-h-[80px] bg-slate-50/50">
                      <div className="text-[10px] text-slate-500 font-semibold mb-1 uppercase">Tireur (Signature)</div>
                   </div>
                </div>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 no-print">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-[6px] hover:bg-slate-50 transition cursor-pointer">
            Annuler
          </button>
          <button 
            onClick={() => {
              window.print();
            }}
            className="px-4 py-2 text-[13px] font-semibold text-white bg-primary rounded-[6px] hover:bg-emerald-600 transition flex items-center gap-2 border-none cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
        </div>
      </div>
    </div>
  );
}
