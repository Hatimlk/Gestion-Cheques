import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { Check } from "@/lib/types";
import { formatMAD, cn } from "@/lib/utils";
import {
  Settings, LayoutList, Users, CalendarDays,
  BookOpen, BarChart3, Building2, Eye, Pencil,
  User, ChevronDown, CheckCircle2, Activity,
  FileText, Calendar as CalendarIcon, FileCheck, AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { NewCheckModal } from "@/components/NewCheckModal";
import { ViewCheckModal } from "@/components/ViewCheckModal";

const SemiCircleGauge = ({ value, total, color, label, count, amount }: any) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const data = [
    { name: 'value', value: percentage },
    { name: 'empty', value: 100 - percentage }
  ];
  return (
    <div className="bg-white rounded-[16px] p-6 border border-slate-100 flex flex-col items-center relative shadow-sm h-[200px] justify-between">
      <div className="absolute top-4 left-4 w-6 h-6 rounded-[6px] flex items-center justify-center text-[11px] font-bold" style={{ color: color, backgroundColor: `${color}1A` }}>
        {count}
      </div>
      <div className="h-[130px] w-[180px] flex justify-center mt-2 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={70} outerRadius={85} paddingAngle={0} dataKey="value" stroke="none" cornerRadius={10}>
              <Cell fill={color} />
              <Cell fill="#F1F5F9" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-2 flex flex-col items-center">
          <span className="text-[20px] font-bold text-slate-800">{percentage}%</span>
          <span className="text-[11px] font-medium text-slate-400 mt-0.5">{label}</span>
        </div>
      </div>
      <div className="mt-auto font-bold text-[14px] text-[#1E293B]">
        {formatMAD(amount).replace('MAD', 'DH')}
      </div>
    </div>
  );
};

const TOP10_SORTS = [
  "Montant le plus élevé",
  "Montant le plus faible",
  "Échéance la plus proche",
  "Échéance la plus lointaine",
  "En retard d'abord",
  "Date d'émission la plus récente",
  "Date d'émission la plus ancienne",
  "Code (A-Z)",
  "Code (Z-A)"
];

const PARTNERS_SORTS = [
  "Top client à payer", 
  "Moins client à payer", 
  "Montant total le plus élevé", 
  "Montant payé le plus élevé", 
  "Nom (A-Z)", 
  "Nom (Z-A)"
];

const CALENDAR_STATUSES = [
  "Tous les statuts",
  "En Circulation",
  "Déposé",
  "Impayé",
  "Payé",
  "Annulé"
];

const WEEK_FILTERS = [
  "Tous les statuts", 
  "Non Payé", 
  "Payé", 
  "Annulé"
];

const ANNUAL_FILTERS = [
  "Total des montants à payer par mois",
  "Total des montants déjà payés par mois",
  "Total des montants annulés par mois"
];

function DropdownSelect({ options, value, onChange, prefix = "", buttonClassName = "" }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn("flex items-center justify-between gap-2 bg-white px-3 py-1.5 rounded-[6px] border border-slate-800 text-[11px] font-bold text-slate-800 whitespace-nowrap cursor-pointer hover:bg-slate-50 relative z-20", buttonClassName)}
      >
        <span>{prefix && <span className="text-slate-500 font-normal">{prefix}</span>}{value}</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)}></div>
          <div className="absolute left-0 top-full mt-1.5 min-w-[220px] w-full bg-white rounded-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 py-1.5 z-40 flex flex-col">
            {options.map((opt: string) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-[12px] transition-colors border-none bg-transparent cursor-pointer",
                  opt === value ? "bg-slate-100 text-slate-800 font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function Dashboard() {
  const { checks, checkbooks, partnerList, bankAccounts } = useApp();
  const navigate = useNavigate();

  // Dashboard controls state
  const [top10Sort, setTop10Sort] = useState(TOP10_SORTS[0]);
  const [partnersSort, setPartnersSort] = useState(PARTNERS_SORTS[0]);
  const [calendarFilter, setCalendarFilter] = useState(CALENDAR_STATUSES[0]);
  const [weekFilter, setWeekFilter] = useState(WEEK_FILTERS[0]);
  const [annualFilter, setAnnualFilter] = useState(ANNUAL_FILTERS[0]);
  const [checkToView, setCheckToView] = useState<Check | null>(null);
  const [checkToEdit, setCheckToEdit] = useState<Check | null>(null);

  // Year selector — build list from data
  const availableYears = Array.from(new Set<number>(checks.map(c => parseInt(c.dueDate.substring(0, 4), 10)))).filter(y => !isNaN(y)).sort((a, b) => b - a);
  const currentYear = new Date().getFullYear();
  const defaultYear = availableYears.includes(currentYear) ? currentYear : (availableYears[0] ?? currentYear);
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  // Status totals
  const statusCounts = { "En Circulation": 0, "En Retard": 0, "Payé": 0, "Annulé": 0 };
  let enCirculationAmount = 0, enRetardAmount = 0, payeAmount = 0, annuleAmount = 0;
  checks.forEach(c => {
    if (c.status === "En Circulation") { statusCounts["En Circulation"]++; enCirculationAmount += c.amount; }
    if (c.status === "En Retard") { statusCounts["En Retard"]++; enRetardAmount += c.amount; }
    if (c.status === "Payé") { statusCounts["Payé"]++; payeAmount += c.amount; }
    if (c.status === "Annulé") { statusCounts["Annulé"]++; annuleAmount += c.amount; }
  });
  const totalAmount = enCirculationAmount + enRetardAmount + payeAmount + annuleAmount;
  const totalCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const emittedChecks = checks;
  const totalEmittedAmount = emittedChecks.reduce((s, c) => s + c.amount, 0);

  // Partner helpers (defined before topPartners so they can be used in sort)
  const getPartnerPaid = (id: string | number) =>
    emittedChecks.filter(c => c.partnerId === String(id) && c.status === "Payé").reduce((s, c) => s + c.amount, 0);
  const getPartnerUnpaid = (id: string | number) =>
    emittedChecks.filter(c => c.partnerId === String(id) && c.status !== "Payé" && c.status !== "Annulé").reduce((s, c) => s + c.amount, 0);

  // Top 10 checks with sort
  const top10Checks = [...emittedChecks]
    .sort((a, b) => {
      if (top10Sort === "Montant le plus élevé") return b.amount - a.amount;
      if (top10Sort === "Montant le plus faible") return a.amount - b.amount;
      if (top10Sort === "Échéance la plus proche") return (a.dueDate || "").localeCompare(b.dueDate || "");
      if (top10Sort === "Échéance la plus lointaine") return (b.dueDate || "").localeCompare(a.dueDate || "");
      if (top10Sort === "En retard d'abord") {
        const weightA = a.status === "En Retard" ? 0 : 1;
        const weightB = b.status === "En Retard" ? 0 : 1;
        if (weightA !== weightB) return weightA - weightB;
        return (a.dueDate || "").localeCompare(b.dueDate || "");
      }
      if (top10Sort === "Date d'émission la plus récente") return (b.emissionDate || "").localeCompare(a.emissionDate || "");
      if (top10Sort === "Date d'émission la plus ancienne") return (a.emissionDate || "").localeCompare(b.emissionDate || "");
      if (top10Sort === "Code (A-Z)") return (a.number || "").localeCompare(b.number || "");
      if (top10Sort === "Code (Z-A)") return (b.number || "").localeCompare(a.number || "");
      return b.amount - a.amount;
    })
    .slice(0, 10);

  // Top partners with sort
  const topPartners = [...partnerList]
    .sort((a, b) => {
      if (partnersSort === "Top client à payer") return getPartnerUnpaid(b.id) - getPartnerUnpaid(a.id);
      if (partnersSort === "Moins client à payer") return getPartnerUnpaid(a.id) - getPartnerUnpaid(b.id);
      if (partnersSort === "Montant total le plus élevé") return (getPartnerPaid(b.id) + getPartnerUnpaid(b.id)) - (getPartnerPaid(a.id) + getPartnerUnpaid(a.id));
      if (partnersSort === "Montant payé le plus élevé") return getPartnerPaid(b.id) - getPartnerPaid(a.id);
      if (partnersSort === "Nom (A-Z)") return a.name.localeCompare(b.name);
      if (partnersSort === "Nom (Z-A)") return b.name.localeCompare(a.name);
      return getPartnerUnpaid(b.id) - getPartnerUnpaid(a.id);
    })
    .slice(0, 4);

  const getDaysInfo = (dueDate: string) => {
    if (!dueDate) return { label: "N/A", color: "text-slate-500 bg-slate-50" };
    const due = new Date(dueDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return {
      label: diff === 0 ? "Auj." : diff < 0 ? `${Math.abs(diff)}j` : `+${diff}`,
      color: diff < 0 ? 'text-red-500 bg-red-50' : diff <= 7 ? 'text-orange-500 bg-orange-50' : 'text-primary bg-primary/10'
    };
  };

  const lowCheckbooks = checkbooks.filter(cb => cb.remaining < 10).sort((a, b) => a.remaining - b.remaining);

  // Monthly stats filtered by selected year
  const monthlyStats = (() => {
    const months: Record<string, { total: number; count: number }> = {};
    emittedChecks.filter(c => c.dueDate.startsWith(String(selectedYear))).forEach(c => {
      let match = false;
      if (annualFilter === "Total des montants à payer par mois") {
        match = c.status !== "Payé" && c.status !== "Annulé";
      } else if (annualFilter === "Total des montants déjà payés par mois") {
        match = c.status === "Payé";
      } else if (annualFilter === "Total des montants annulés par mois") {
        match = c.status === "Annulé";
      }

      if (match) {
        const month = c.dueDate.substring(5, 7);
        if (!months[month]) months[month] = { total: 0, count: 0 };
        months[month].total += c.amount;
        months[month].count++;
      }
    });
    return months;
  })();

  const monthNames = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

  // Weekly checks with filter
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);
  weekEnd.setHours(23, 59, 59, 999);
  const weekChecks = emittedChecks.filter(c => {
    const d = new Date(c.dueDate + 'T00:00:00');
    const inRange = d >= today && d <= weekEnd;
    
    let matchFilter = true;
    if (weekFilter === "Non Payé") {
      matchFilter = ["En Circulation", "En Retard", "Déposé", "Impayé"].includes(c.status);
    } else if (weekFilter !== "Tous les statuts") {
      matchFilter = c.status === weekFilter;
    }
    
    return inRange && matchFilter;
  }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const getNext7Days = () => Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });
  const weekDays = getNext7Days();

  // Calendar logic
  const currentMonthName = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(today);
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const calendarGrid: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) calendarGrid.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarGrid.push(i);
  while (calendarGrid.length % 7 !== 0) calendarGrid.push(null);

  const calendarDaysNames = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];
  const filteredForCalendar = calendarFilter === "Tous les statuts"
    ? emittedChecks
    : emittedChecks.filter(c => c.status === calendarFilter);

  const checksByDay = filteredForCalendar.reduce<Record<number, typeof emittedChecks>>((acc, c) => {
    const d = new Date(c.dueDate + 'T00:00:00');
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!acc[day]) acc[day] = [];
      acc[day].push(c);
    }
    return acc;
  }, {});

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">

      {/* Top Cards Row */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <SemiCircleGauge value={enCirculationAmount} total={totalAmount} count={statusCounts["En Circulation"]} amount={enCirculationAmount} label="En Circulation" color="#F59E0B" />
          <SemiCircleGauge value={enRetardAmount} total={totalAmount} count={statusCounts["En Retard"]} amount={enRetardAmount} label="En Retard" color="#FF5B37" />
          <SemiCircleGauge value={payeAmount} total={totalAmount} count={statusCounts["Payé"]} amount={payeAmount} label="Payé" color="#22C55E" />
          <SemiCircleGauge value={annuleAmount} total={totalAmount} count={statusCounts["Annulé"]} amount={annuleAmount} label="Annulé" color="#CBD5E1" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border border-slate-200 text-[11px] font-semibold text-slate-500 shadow-sm">
            <span><CheckCircle2 className="w-3 h-3 text-slate-400 inline mb-0.5" /> Totaux :</span>
            <div className="flex items-center gap-1.5">
              <span className="bg-cyan-100 text-cyan-600 px-1.5 rounded-[4px]">{totalCount}</span>
              <span className="text-[#1E293B] font-bold">{formatMAD(totalAmount).replace('MAD', 'DH')}</span>
            </div>
          </div>
          <button onClick={() => navigate("/roles")} title="Paramètres" className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center border-none shadow-sm cursor-pointer hover:bg-slate-700">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Middle Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1 */}
        <div className="space-y-6">
          {/* Top 10 valeurs */}
          <div className="bg-white rounded-[16px] border border-slate-100 shadow-sm p-5 flex flex-col min-h-[400px]">
            <div className="flex items-center gap-2 font-bold text-[14px] text-slate-800 mb-4">
              <LayoutList className="w-4 h-4 text-slate-400" /> Top 10 valeurs
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-4 pb-1">
              <DropdownSelect 
                options={TOP10_SORTS} 
                value={top10Sort} 
                onChange={setTop10Sort} 
                prefix="Trier par: " 
              />
              <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-red-400"></span> En retard
              </div>
              <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span> Proche
              </div>
              <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-primary"></span> Loin
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {top10Checks.map(check => (
                <div key={check.id} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded-[4px] font-bold text-white", check.type === 'Effet' ? 'bg-[#FF9800]' : 'bg-[#1E293B]')}>{check.type === 'Effet' ? 'LCN' : 'CHQ'}</span>
                      <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full",
                        check.status === 'En Retard' ? 'bg-red-50 text-red-600' :
                        check.status === 'En Circulation' ? 'bg-cyan-50 text-cyan-600' :
                        check.status === 'Payé' ? 'bg-green-50 text-green-600' :
                        'bg-slate-100 text-slate-600'
                      )}>{check.status}</span>
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-sm", getDaysInfo(check.dueDate).color)}>
                        {getDaysInfo(check.dueDate).label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase">
                      <User className="w-3 h-3 text-slate-400" /> {check.partnerName}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="font-bold text-[12px] text-[#1E293B]">{formatMAD(check.amount).replace('MAD', 'DH')}</div>
                    <div className="flex gap-2">
                      <span title="Voir"><Eye onClick={() => setCheckToView(check)} className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" /></span>
                      <span title="Modifier"><Pencil onClick={() => setCheckToEdit(check)} className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-blue-600" /></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate("/emis")} className="mt-4 w-full py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-blue-600 text-[12px] font-bold rounded-[8px] transition-colors border-none cursor-pointer">
              Voir tous les chèques
            </button>
          </div>

          {/* Carnets bientôt épuisés */}
          <div className="bg-white rounded-[16px] border border-slate-100 shadow-sm p-5 flex flex-col min-h-[250px]">
            <div className="flex items-center gap-2 font-bold text-[14px] text-slate-800 mb-6">
              <BookOpen className="w-4 h-4 text-slate-400" /> Carnets bientôt épuisés
            </div>
            {lowCheckbooks.length > 0 ? (
              <div className="flex-1 space-y-3">
                {lowCheckbooks.slice(0, 5).map(cb => (
                  <div key={cb.id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                    <div className="flex flex-col">
                      <span className="font-bold text-[11px] text-slate-800">{cb.bankName}</span>
                      <span className="text-[10px] text-slate-500">{cb.type} — N°{cb.startNumber}-{cb.endNumber}</span>
                    </div>
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{cb.remaining} restants</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-4 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 border border-slate-100">
                  <FileText className="w-5 h-5 text-slate-400" />
                </div>
                <div className="font-bold text-[12px] text-slate-800 mb-1">Tous les carnets sont sains</div>
                <div className="text-[11px] text-slate-500 mb-4">Aucun carnet n'est bientôt vide.</div>
                <button onClick={() => navigate("/carnets")} className="bg-[#0F172A] text-white px-5 py-2 rounded-full text-[11px] font-bold cursor-pointer border-none hover:bg-slate-800 transition-colors">
                  Voir les carnets
                </button>
              </div>
            )}
            <button onClick={() => navigate("/carnets")} className="mt-4 w-full py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-blue-600 text-[12px] font-bold rounded-[8px] transition-colors border-none cursor-pointer">
              Gérer les carnets
            </button>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-6">
          {/* Top bénéficiaires */}
          <div className="bg-white rounded-[16px] border border-slate-100 shadow-sm p-5 flex flex-col min-h-[400px]">
            <div className="flex items-center gap-2 font-bold text-[14px] text-slate-800 mb-4">
              <Users className="w-4 h-4 text-slate-400" /> Top bénéficiaires
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-4 pb-1">
              <DropdownSelect 
                options={PARTNERS_SORTS} 
                value={partnersSort} 
                onChange={setPartnersSort} 
                prefix="Trier par: " 
              />
              <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-primary"></span> Valeurs payées
              </div>
              <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span> Valeurs à payer
              </div>
            </div>
            <div className="flex-1 space-y-4">
              {topPartners.map(partner => (
                <div key={partner.id} className="flex flex-col gap-2.5 py-2 border-b border-slate-50 last:border-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase">
                      <User className="w-3.5 h-3.5 text-slate-400" /> {partner.name}
                    </div>
                    <div className="font-bold text-[12px] text-[#1E293B]">{formatMAD(getPartnerPaid(partner.id) + getPartnerUnpaid(partner.id)).replace('MAD', 'DH')}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> {formatMAD(getPartnerPaid(partner.id)).replace('MAD', 'DH')}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      <Activity className="w-3 h-3" /> {formatMAD(getPartnerUnpaid(partner.id)).replace('MAD', 'DH')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate("/partenaires")} className="mt-4 w-full py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-blue-600 text-[12px] font-bold rounded-[8px] transition-colors border-none cursor-pointer">
              Gérer les partenaires
            </button>
          </div>

          {/* Statistique annuel */}
          <div className="bg-white rounded-[16px] border border-slate-100 shadow-sm p-5 flex flex-col min-h-[250px] relative">
            <div className="flex items-center gap-2 font-bold text-[14px] text-slate-800 mb-4">
              <BarChart3 className="w-4 h-4 text-slate-400" /> Statistique annuel
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-4 pb-1 relative z-20">
              <DropdownSelect 
                options={availableYears.length > 0 ? availableYears.map(String) : [String(currentYear)]} 
                value={String(selectedYear)} 
                onChange={(val: string) => setSelectedYear(parseInt(val, 10))} 
                buttonClassName="border-slate-200 text-slate-600 font-medium"
              />
              <DropdownSelect 
                options={ANNUAL_FILTERS} 
                value={annualFilter} 
                onChange={setAnnualFilter} 
                buttonClassName="border-slate-800 text-slate-800"
              />
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-1 relative z-10">
              {monthNames.map((name, idx) => {
                const key = String(idx + 1).padStart(2, '0');
                const stat = monthlyStats[key];
                return stat ? (
                  <div key={key} className="flex justify-between items-center py-2 text-[11px]">
                    <span className="font-bold text-slate-600">{name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-800">{formatMAD(stat.total).replace('MAD', 'DH')}</span>
                      <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-[4px] font-bold">{stat.count}</span>
                    </div>
                  </div>
                ) : null;
              })}
              {Object.keys(monthlyStats).length === 0 && (
                <div className="text-center text-[12px] text-slate-400 py-4">Aucune donnée pour {selectedYear}</div>
              )}
              {Object.keys(monthlyStats).length > 0 && (
                <div className="flex justify-between items-center py-2.5 text-[11px] bg-slate-50 px-3 -mx-3 rounded-[8px] mt-1">
                  <span className="font-bold text-[#1E293B]">Total</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#1E293B]">{formatMAD(Object.values(monthlyStats).reduce((s, m) => s + m.total, 0)).replace('MAD', 'DH')}</span>
                    <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-[4px] font-bold">{Object.values(monthlyStats).reduce((s, m) => s + m.count, 0)}</span>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => navigate("/emis")} className="mt-4 w-full py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-blue-600 text-[12px] font-bold rounded-[8px] transition-colors border-none cursor-pointer relative z-10">
              Plus de résultats
            </button>
          </div>
        </div>

        {/* Column 3 */}
        <div className="space-y-6">
          {/* À payer cette semaine */}
          <div className="bg-white rounded-[16px] border border-slate-100 shadow-sm p-5 flex flex-col min-h-[400px]">
            <div className="flex items-center gap-2 font-bold text-[14px] text-slate-800 mb-4">
              <CalendarIcon className="w-4 h-4 text-slate-400" /> À échéance cette semaine
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-4 pb-1">
              <DropdownSelect 
                options={WEEK_FILTERS} 
                value={weekFilter} 
                onChange={setWeekFilter} 
              />
              <div className="flex items-center gap-1 bg-cyan-50 text-cyan-700 px-2 py-1 rounded-[6px] text-[10px] font-bold whitespace-nowrap">
                Total: {weekChecks.length}
              </div>
              <div className="flex items-center gap-1 bg-cyan-50 text-cyan-700 px-2 py-1 rounded-[6px] text-[10px] font-bold whitespace-nowrap">
                {formatMAD(weekChecks.reduce((s, c) => s + c.amount, 0)).replace('MAD', 'DH')}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {weekDays.map((date, idx) => {
                const dateStr = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
                const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                const dayChecks = emittedChecks.filter(c => {
                  let matchFilter = true;
                  if (weekFilter === "Non Payé") {
                    matchFilter = ["En Circulation", "En Retard", "Déposé", "Impayé"].includes(c.status);
                  } else if (weekFilter !== "Tous les statuts") {
                    matchFilter = c.status === weekFilter;
                  }
                  return c.dueDate === dateKey && matchFilter;
                });
                return (
                  <div key={idx} className="flex flex-col gap-2 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400" /> {dateStr}
                    </div>
                    {dayChecks.length > 0 ? dayChecks.map(c => (
                      <div key={c.id} className="flex justify-between items-center pl-5">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-[9px] px-1.5 py-0.5 rounded-[4px] font-bold text-white", c.type === 'Effet' ? 'bg-[#FF9800]' : 'bg-[#1E293B]')}>{c.type === 'Effet' ? 'LCN' : 'CHQ'}</span>
                          <span className="text-[10px] font-bold text-slate-800">{c.partnerName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[11px] text-slate-800">{formatMAD(c.amount).replace('MAD', 'DH')}</span>
                          <div className="flex gap-1.5">
                            <span title="Voir"><Eye onClick={() => setCheckToView(c)} className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" /></span>
                            <span title="Modifier"><Pencil onClick={() => setCheckToEdit(c)} className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-blue-600" /></span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-[10px] text-slate-400 pl-5">Aucun chèque pour ce jour.</div>
                    )}
                  </div>
                );
              })}
            </div>
            <button onClick={() => navigate("/calendrier")} className="mt-4 w-full py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-blue-600 text-[12px] font-bold rounded-[8px] transition-colors border-none cursor-pointer">
              Voir le calendrier
            </button>
          </div>

          {/* Totaux par compte bancaire */}
          <div className="bg-white rounded-[16px] border border-slate-100 shadow-sm p-5 flex flex-col min-h-[250px]">
            <div className="flex items-center gap-2 font-bold text-[14px] text-slate-800 mb-4">
              <Building2 className="w-4 h-4 text-slate-400" /> Totaux par compte
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-1">
              {bankAccounts.map(acc => {
                const accChecks = emittedChecks.filter(c => c.bankAccountId === acc.id);
                const accTotal = accChecks.reduce((s, c) => s + c.amount, 0);
                const accCount = accChecks.length;
                return accCount > 0 ? (
                  <div key={acc.id} className="flex justify-between items-center py-2 text-[11px]">
                    <span className="font-bold text-slate-800 uppercase">{acc.bankName}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-800">{formatMAD(accTotal).replace('MAD', 'DH')}</span>
                      <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-[4px] font-bold">{accCount}</span>
                    </div>
                  </div>
                ) : null;
              })}
              <div className="flex justify-between items-center py-2.5 text-[11px] bg-slate-50 px-3 -mx-3 rounded-[8px] mt-1">
                <span className="font-bold text-[#1E293B]">Total</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#1E293B]">{formatMAD(totalEmittedAmount).replace('MAD', 'DH')}</span>
                  <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-[4px] font-bold">{emittedChecks.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar section */}
      <div className="flex items-center justify-between mt-8 mb-4">
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 text-[11px] font-semibold text-slate-500 shadow-sm">
          <span>Total Valeurs</span>
          <div className="flex items-center gap-1.5">
            <span className="bg-slate-100 text-slate-600 px-1.5 rounded-[4px]">{emittedChecks.length}</span>
            <span className="text-[#1E293B] font-bold">{formatMAD(totalEmittedAmount).replace('MAD', 'DH')}</span>
          </div>
        </div>

        <DropdownSelect 
          options={CALENDAR_STATUSES} 
          value={calendarFilter} 
          onChange={setCalendarFilter} 
        />
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-[16px] border border-slate-200 shadow-sm overflow-hidden flex flex-col mb-10">
        <div className="p-4 text-center font-bold text-[16px] text-slate-800 border-b border-slate-100">
          <span className="capitalize">{currentMonthName}</span>
        </div>
        <div className="px-4 py-3 border-b border-slate-100 flex gap-4 text-[10px] font-medium">
          <span className="text-slate-500 font-bold">Guide :</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400"></span> En Circulation</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> En Retard</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Déposé</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-600"></span> Impayé</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> Payé</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Annulé</span>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-100 bg-[#F8FAFC]">
          {calendarDaysNames.map(d => (
            <div key={d} className="py-2 text-center text-[11px] font-bold text-slate-500 border-r border-slate-100 last:border-0">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 bg-white">
          {calendarGrid.map((day, idx) => {
            const dayChecks = day ? checksByDay[day] || [] : [];
            const isToday = day === today.getDate();
            return (
              <div key={idx} className="min-h-[100px] border-r border-b border-slate-100 p-2 relative group hover:bg-slate-50 transition-colors">
                {day && (
                  <>
                    <span className={cn("absolute top-2 right-2 text-[11px] font-semibold", isToday ? "w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center" : "text-slate-400")}>
                      {day}
                    </span>
                    {dayChecks.slice(0, 3).map(c => (
                      <div
                        key={c.id}
                        onClick={() => setCheckToView(c)}
                        className="mt-5 w-full bg-white border border-red-500 rounded-[6px] shadow-sm overflow-hidden border-l-[3px] cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="px-1.5 py-1 text-[8px] font-bold text-red-600 border-b border-slate-100 uppercase">ÉMIS</div>
                        <div className="px-1.5 py-1 flex items-center justify-between bg-orange-50">
                          <span className={cn("text-white px-1 rounded-[2px] text-[8px] font-bold", c.type === 'Effet' ? 'bg-[#FF9800]' : 'bg-black')}>{c.type === 'Effet' ? 'LCN' : 'CHQ'}</span>
                          <span className="text-[9px] font-bold text-slate-700">{formatMAD(c.amount).replace('MAD', 'dh')}</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <ViewCheckModal check={checkToView} onClose={() => setCheckToView(null)} />
      <NewCheckModal isOpen={!!checkToEdit} onClose={() => setCheckToEdit(null)} editCheck={checkToEdit} />
    </div>
  );
}
