import { useState } from "react";
import { formatMAD, cn, getStatusChartColor } from "@/lib/utils";
import { ArrowUpRight, ArrowDownLeft, AlertCircle, Calendar as CalendarIcon, Wallet } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const GAUGE_DATA = [
  { name: 'En Circulation', value: 45, amount: 250000, color: getStatusChartColor('En Circulation') },
  { name: 'En Retard', value: 12, amount: 85000, color: getStatusChartColor('En Retard') },
  { name: 'Payé', value: 156, amount: 1200000, color: getStatusChartColor('Payé') },
  { name: 'Annulé', value: 3, amount: 15000, color: getStatusChartColor('Annulé') },
];

const MONTHLY_DATA = [
  { name: 'Jan', emitted: 4000, received: 2400 },
  { name: 'Fév', emitted: 3000, received: 1398 },
  { name: 'Mar', emitted: 2000, received: 9800 },
  { name: 'Avr', emitted: 2780, received: 3908 },
  { name: 'Mai', emitted: 1890, received: 4800 },
  { name: 'Juin', emitted: 2390, received: 3800 },
  { name: 'Juil', emitted: 3490, received: 4300 },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"emis" | "recus">("emis");

  const totalAmount = GAUGE_DATA.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-[18px] mb-0 font-bold text-slate-900 tracking-tight">Tableau de Bord</h1>
        <div className="flex items-center bg-slate-100 p-0.5 rounded-[6px]">
          <button 
            className={cn("px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all duration-200", activeTab === "emis" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            onClick={() => setActiveTab("emis")}
          >
            Chèques Émis
          </button>
          <button 
            className={cn("px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all duration-200", activeTab === "recus" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            onClick={() => setActiveTab("recus")}
          >
            Chèques Reçus
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {GAUGE_DATA.map((item) => (
          <div key={item.name} className="bg-white p-4 rounded-[12px] border border-slate-200 flex flex-col gap-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-slate-500">{item.name}</span>
              <span className="font-bold text-[13px]" style={{ color: item.color }}>{item.value}</span>
            </div>
            <div className="text-[18px] font-bold text-slate-900">{formatMAD(item.amount)}</div>
            <div className="absolute -bottom-4 -right-4 opacity-10">
              <div 
                className="w-24 h-24 rounded-full border-[10px]" 
                style={{ borderColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Main Chart */}
        <div className="bg-white p-4 rounded-[12px] border border-slate-200 lg:col-span-3">
          <h2 className="text-[14px] font-semibold text-slate-900 mb-4 m-0">Évolution Annuelle (MAD)</h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="emitted" name="Émis" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="received" name="Reçus" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Widgets */}
        <div className="space-y-4 lg:col-span-2">
          {/* Calendar Widget */}
          <div className="bg-white p-4 rounded-[12px] border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-semibold text-slate-900 m-0">À Payer Cette Semaine</h2>
              <CalendarIcon className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-red-50 p-2.5 rounded-[8px] border border-red-100">
                <div>
                  <div className="text-[12px] font-semibold text-red-900">Aujourd'hui</div>
                  <div className="text-[11px] text-red-700 mt-0.5">3 Chèques</div>
                </div>
                <div className="font-bold text-red-700 text-[13px]">{formatMAD(45000)}</div>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-[8px] border border-slate-100">
                <div>
                  <div className="text-[12px] font-semibold text-slate-900">Dans 3 Jours</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">1 Effet</div>
                </div>
                <div className="font-bold text-slate-700 text-[13px]">{formatMAD(12500)}</div>
              </div>
            </div>
          </div>

          {/* Alert Widget */}
          <div className="bg-orange-50 p-4 rounded-[12px] border border-orange-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-[18px] h-[18px] text-orange-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-[13px] font-semibold text-orange-900 m-0">Alerte Carnet Faible</h3>
                <p className="text-[11px] text-orange-700 mt-1 leading-relaxed">
                  Le carnet Attijariwafa Bank n'a plus que 5 chèques disponibles.
                </p>
                <button className="mt-2 text-[11px] font-semibold bg-orange-600 text-white px-3 py-1.5 rounded-[6px] hover:bg-orange-700 transition">
                  Commander
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-8">
        <div className="bg-white rounded-[12px] border border-slate-200 overflow-hidden">
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-[14px] font-semibold text-slate-900 m-0">Top 5 Chèques En Retard</h2>
            <button className="text-[12px] text-primary hover:text-emerald-700 font-semibold bg-transparent border-none cursor-pointer">Voir tout ➜</button>
          </div>
          <div className="px-4 pb-2">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr>
                  <th className="py-3 px-2 text-[10px] uppercase font-semibold text-slate-500 border-b-2 border-slate-100">Bénéficiaire</th>
                  <th className="py-3 px-2 text-[10px] uppercase font-semibold text-slate-500 border-b-2 border-slate-100">Échéance</th>
                  <th className="py-3 px-2 text-[10px] uppercase font-semibold text-slate-500 border-b-2 border-slate-100 text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td className="py-2.5 px-2 border-b border-slate-50 text-slate-900">Fournitures SARL</td>
                    <td className="py-2.5 px-2 text-red-600 border-b border-slate-50">Il y a {i * 2} jours</td>
                    <td className="py-2.5 px-2 text-right font-semibold border-b border-slate-50">{formatMAD(15000 * i)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-[12px] border border-slate-200 overflow-hidden">
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-[14px] font-semibold text-slate-900 m-0">Top Partenaires (À Payer)</h2>
            <button className="text-[12px] text-primary hover:text-emerald-700 font-semibold bg-transparent border-none cursor-pointer">Voir tout ➜</button>
          </div>
          <div className="px-4 pb-2">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr>
                  <th className="py-3 px-2 text-[10px] uppercase font-semibold text-slate-500 border-b-2 border-slate-100">Bénéficiaire</th>
                  <th className="py-3 px-2 text-[10px] uppercase font-semibold text-slate-500 border-b-2 border-slate-100 text-right">Total MAD</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    <td className="py-2.5 px-2 border-b border-slate-50 text-slate-900 flex items-center gap-2">
                       <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold">P</div>
                       Partenaire Beta {i}
                    </td>
                    <td className="py-2.5 px-2 text-right font-semibold border-b border-slate-50">{formatMAD(250000 / i)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
