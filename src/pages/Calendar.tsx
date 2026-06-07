import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { getStatusChartColor, getStatusColor, cn } from "@/lib/utils";
import { useApp } from "@/lib/AppContext";
import { NewCheckModal } from "@/components/NewCheckModal";

export function Calendar() {
  const { checks } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isNewCheckModalOpen, setIsNewCheckModalOpen] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = monthStart.getDay() || 7;
  const paddedDays = Array.from({ length: startDayOfWeek - 1 }).map((_, i) => null);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 mb-2">
        <div className="flex items-center gap-4">
          <h1 className="text-[18px] mb-0 font-bold text-slate-900 tracking-tight capitalize">
            {format(currentDate, "MMMM yyyy", { locale: fr })}
          </h1>
          <div className="flex items-center bg-slate-100 rounded-[6px] p-0.5">
            <button onClick={prevMonth} className="p-1 hover:bg-white rounded-[4px] transition text-slate-500 border-none cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-[12px] font-semibold text-slate-700 hover:text-slate-900 border-none bg-transparent cursor-pointer">
              Aujourd'hui
            </button>
            <button onClick={nextMonth} className="p-1 hover:bg-white rounded-[4px] transition text-slate-500 border-none cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsNewCheckModalOpen(true)} className="flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-[6px] text-[12px] font-semibold hover:opacity-90 transition shadow-sm border-none cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            Nouveau Chèque
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-2 shrink-0 overflow-x-auto hide-scrollbar text-[12px]">
        <div className="flex items-center gap-2 mr-4">
          <span className="text-slate-500 font-semibold">Légende:</span>
        </div>
        {["En Circulation", "En Retard", "Déposé", "Impayé", "Payé", "Annulé"].map(status => (
          <div key={status} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getStatusChartColor(status) }} />
            <span className="text-slate-600 font-medium truncate">{status}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 bg-white rounded-[12px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="grid grid-cols-7 border-b border-slate-200 shrink-0">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
            <div key={day} className="py-2.5 text-center text-[11px] font-semibold uppercase text-slate-500 bg-slate-50">
              {day}
            </div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-7 auto-rows-fr font-sans">
          {paddedDays.map((_, i) => (
            <div key={`pad-${i}`} className="border-b border-r border-slate-100 bg-slate-50/50" />
          ))}

          {daysInMonth.map((day, i) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayChecks = checks.filter(c => c.dueDate === dateStr || c.emissionDate === dateStr);
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "border-b border-r border-slate-100 p-2 overflow-y-auto transition-colors hover:bg-slate-50",
                  !isCurrentMonth && "bg-slate-50/50 text-slate-400",
                  isToday(day) && "bg-primary/5"
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={cn("text-[12px] font-bold w-6 h-6 flex items-center justify-center rounded-full", isToday(day) ? "bg-primary text-white" : "text-slate-700")}>
                    {format(day, "d")}
                  </span>
                </div>

                <div className="space-y-1">
                  {dayChecks.map(check => (
                    <div
                      key={check.id}
                      className={cn(
                        "text-[10px] px-1.5 py-1 rounded-[4px] border truncate flex flex-col cursor-pointer hover:shadow-sm transition",
                        getStatusColor(check.status).split(" ")[0],
                        getStatusColor(check.status).split(" ")[2]
                      )}
                      title={`${check.partnerName} - ${check.amount.toLocaleString()} MAD`}
                    >
                      <div className="font-bold truncate text-slate-800">{check.partnerName}</div>
                      <div className="truncate opacity-80 text-slate-600">{check.amount.toLocaleString()} MAD</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <NewCheckModal isOpen={isNewCheckModalOpen} onClose={() => setIsNewCheckModalOpen(false)} />
    </div>
  );
}
