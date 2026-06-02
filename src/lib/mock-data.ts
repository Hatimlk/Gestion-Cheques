import { BankAccount, Check, Checkbook, Company, Partner } from "./types";

export const MOCK_COMPANIES: Company[] = [
  { id: "c1", name: "Tech Solutions SARL" },
  { id: "c2", name: "Global Import Export" },
];

export const MOCK_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "b1", companyId: "c1", bankName: "Attijariwafa Bank", rib: "007 780 0000000000000012 34", checkbooksCount: 2, totals: { nonPaid: 150000, paid: 450000, cancelled: 0 }
  },
  {
    id: "b2", companyId: "c1", bankName: "Bank of Africa", rib: "011 780 0000000000000056 78", checkbooksCount: 1, totals: { nonPaid: 50000, paid: 120000, cancelled: 5000 }
  }
];

export const MOCK_CHECKBOOKS: Checkbook[] = [
  { id: "cb1", bankAccountId: "b1", bankName: "Attijariwafa Bank", type: "Chèque", creationDate: "2023-10-01", startNumber: "0000001", endNumber: "0000050", remaining: 12, totals: { nonPaid: 5, paid: 30, cancelled: 3 } }
];

export const MOCK_CHECKS: Check[] = [
  { id: "ch1", bankAccountId: "b1", type: "Chèque", number: "0000038", partnerId: "p1", partnerName: "Fournitures Pro", emissionDate: "2023-11-20", dueDate: "2023-12-20", amount: 15000, status: "Payé", isReceived: false },
  { id: "ch2", bankAccountId: "b1", type: "Effet", number: "EFF-001", partnerId: "p2", partnerName: "Marketing Services", emissionDate: "2023-11-25", dueDate: "2026-06-15", amount: 25000, status: "En Circulation", isReceived: false },
  { id: "ch3", bankAccountId: "b2", type: "Chèque", number: "0000012", partnerId: "p3", partnerName: "Client A", emissionDate: "2023-11-15", dueDate: "2023-11-30", amount: 45000, status: "En Retard", isReceived: true },
  { id: "ch4", bankAccountId: "b2", type: "Effet", number: "EFF-092", partnerId: "p4", partnerName: "Client B", emissionDate: "2023-12-01", dueDate: "2023-12-10", amount: 120000, status: "Déposé", isReceived: true },
];

export const MOCK_PARTNERS: Partner[] = [
  { id: "p1", companyId: "c1", name: "Fournitures Pro", type: "Bénéficiaire", totals: { amount: 150000, enCirculation: 50000, enRetard: 0, paye: 100000, annule: 0 } },
  { id: "p3", companyId: "c1", name: "Client A", type: "Émetteur", totals: { amount: 300000, enCirculation: 0, enRetard: 45000, paye: 255000, annule: 0 } }
];
