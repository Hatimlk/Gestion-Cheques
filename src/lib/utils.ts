import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMAD(amount: number) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case "En Circulation":
      return "bg-[#FEF3C7] text-[#D97706]";
    case "En Retard":
      return "bg-[#FEE2E2] text-[#DC2626]";
    case "Déposé":
      return "bg-blue-100 text-blue-700";
    case "Impayé":
      return "bg-orange-100 text-orange-700";
    case "Payé":
      return "bg-[#D1FAE5] text-[#059669]";
    case "Annulé":
      return "bg-[#F3F4F6] text-[#4B5563]";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

export const getStatusChartColor = (status: string) => {
  switch (status) {
    case "En Circulation": return "#FBBF24"; // yellow
    case "En Retard": return "#EF4444"; // red
    case "Déposé": return "#3B82F6"; // blue
    case "Impayé": return "#F97316"; // orange
    case "Payé": return "#10B981"; // green
    case "Annulé": return "#9CA3AF"; // gray
    default: return "#9CA3AF";
  }
};
