import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { BankAccount, Checkbook, Check, CheckStatus, CheckType } from "./types";
import { MOCK_BANK_ACCOUNTS, MOCK_CHECKBOOKS, MOCK_CHECKS } from "./mock-data";

export type UserRole = "Administrateur" | "Comptable" | "Agent de saisie";
export type UserStatus = "Actif" | "Inactif";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export type PartnerType = "Client" | "Fournisseur";

export interface PartnerListItem {
  id: number;
  type: PartnerType;
  name: string;
  contact: string;
  phone: string;
  balance: number;
}

export const COMPANY_NAME = "GADIMAT S.A";

const INITIAL_USERS: User[] = [
  { id: 1, name: "Hatim Lk", email: "hatim@gadimat.ma", role: "Administrateur", status: "Actif" },
  { id: 2, name: "Sara M.", email: "sara@gadimat.ma", role: "Comptable", status: "Actif" },
  { id: 3, name: "Youssef T.", email: "youssef@gadimat.ma", role: "Agent de saisie", status: "Inactif" },
];

const INITIAL_PARTNER_LIST: PartnerListItem[] = [
  { id: 1, type: "Fournisseur", name: "Cimenterie Lafarge", contact: "Ahmed B.", phone: "06 00 00 00 01", balance: -45000 },
  { id: 2, type: "Client", name: "BTP Construction", contact: "Karim M.", phone: "06 00 00 00 02", balance: 120000 },
  { id: 3, type: "Fournisseur", name: "Acier Maroc", contact: "Youssef L.", phone: "06 00 00 00 03", balance: -15000 },
  { id: 4, type: "Client", name: "Entreprise Z", contact: "Hassan T.", phone: "06 00 00 00 04", balance: 0 },
];

interface AppContextType {
  bankAccounts: BankAccount[];
  checkbooks: Checkbook[];
  checks: Check[];
  partnerList: PartnerListItem[];
  users: User[];
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string) => string | null;
  logout: () => void;
  addBankAccount: (data: { bankName: string; rib: string }) => void;
  deleteBankAccount: (id: string) => void;
  addCheckbook: (data: { bankAccountId: string; bankName: string; type: CheckType; startNumber: string; endNumber: string }) => void;
  deleteCheckbook: (id: string) => void;
  addCheck: (data: { bankAccountId: string; checkbookId?: string; type: CheckType; number: string; partnerId: string; partnerName: string; emissionDate: string; dueDate: string; amount: number }) => void;
  updateCheck: (id: string, data: Partial<Omit<Check, 'id' | 'checkbookId'>>) => void;
  updateCheckStatus: (id: string, status: CheckStatus) => void;
  deleteCheck: (id: string) => void;
  updateBankAccount: (id: string, data: { bankName: string; rib: string }) => void;
  addPartnerListItem: (data: Omit<PartnerListItem, "id">) => void;
  updatePartnerListItem: (id: number, data: Partial<PartnerListItem>) => void;
  deletePartnerListItem: (id: number) => void;
  addUser: (data: Omit<User, "id">) => void;
  updateUser: (id: number, data: Partial<User>) => void;
  deleteUser: (id: number) => void;
  toggleUserStatus: (id: number) => void;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {}
  return fallback;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() =>
    loadFromStorage("gadimat_bankAccounts", MOCK_BANK_ACCOUNTS)
  );
  const [checkbooks, setCheckbooks] = useState<Checkbook[]>(() =>
    loadFromStorage("gadimat_checkbooks", MOCK_CHECKBOOKS)
  );
  const [checks, setChecks] = useState<Check[]>(() =>
    loadFromStorage("gadimat_checks", MOCK_CHECKS)
  );
  const [partnerList, setPartnerList] = useState<PartnerListItem[]>(() =>
    loadFromStorage("gadimat_partnerList", INITIAL_PARTNER_LIST)
  );
  const [users, setUsers] = useState<User[]>(() =>
    loadFromStorage("gadimat_users", INITIAL_USERS)
  );
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    loadFromStorage<User | null>("gadimat_currentUser", null)
  );

  const isAuthenticated = currentUser !== null;

  // Auto-update overdue checks on mount
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setChecks(prev => prev.map(c => {
      if (c.status === "En Circulation") {
        const due = new Date(c.dueDate + "T00:00:00");
        if (due < today) return { ...c, status: "En Retard" as CheckStatus };
      }
      return c;
    }));
  }, []);

  const login = useCallback((email: string): string | null => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return "Aucun utilisateur trouvé avec cet email.";
    if (user.status === "Inactif") return "Ce compte est désactivé. Contactez l'administrateur.";
    setCurrentUser(user);
    localStorage.setItem("gadimat_currentUser", JSON.stringify(user));
    return null;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("gadimat_currentUser");
  }, []);

  useEffect(() => { localStorage.setItem("gadimat_bankAccounts", JSON.stringify(bankAccounts)); }, [bankAccounts]);
  useEffect(() => { localStorage.setItem("gadimat_checkbooks", JSON.stringify(checkbooks)); }, [checkbooks]);
  useEffect(() => { localStorage.setItem("gadimat_checks", JSON.stringify(checks)); }, [checks]);
  useEffect(() => { localStorage.setItem("gadimat_partnerList", JSON.stringify(partnerList)); }, [partnerList]);
  useEffect(() => { localStorage.setItem("gadimat_users", JSON.stringify(users)); }, [users]);

  const addBankAccount = useCallback((data: { bankName: string; rib: string }) => {
    const newAccount: BankAccount = {
      id: `ba_${Date.now()}`,
      companyId: "c1",
      bankName: data.bankName,
      rib: data.rib,
      checkbooksCount: 0,
      totals: { nonPaid: 0, paid: 0, cancelled: 0 },
    };
    setBankAccounts(prev => [...prev, newAccount]);
  }, []);

  const deleteBankAccount = useCallback((id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce compte bancaire ? Tous les carnets et chèques associés seront supprimés.")) return;
    setBankAccounts(prev => prev.filter(a => a.id !== id));
    setCheckbooks(prev => prev.filter(cb => cb.bankAccountId !== id));
    setChecks(prev => prev.filter(c => c.bankAccountId !== id));
  }, []);

  const addCheckbook = useCallback((data: { bankAccountId: string; bankName: string; type: CheckType; startNumber: string; endNumber: string }) => {
    const start = parseInt(data.startNumber);
    const end = parseInt(data.endNumber);
    const total = !isNaN(start) && !isNaN(end) ? end - start + 1 : 0;
    const newCheckbook: Checkbook = {
      id: `cb_${Date.now()}`,
      bankAccountId: data.bankAccountId,
      bankName: data.bankName,
      type: data.type,
      creationDate: new Date().toISOString().split("T")[0],
      startNumber: data.startNumber,
      endNumber: data.endNumber,
      remaining: total,
      totals: { nonPaid: 0, paid: 0, cancelled: 0 },
    };
    setCheckbooks(prev => [...prev, newCheckbook]);
    setBankAccounts(prev => prev.map(a =>
      a.id === data.bankAccountId ? { ...a, checkbooksCount: a.checkbooksCount + 1 } : a
    ));
  }, []);

  const deleteCheckbook = useCallback((id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce carnet ?")) return;
    const checkbook = checkbooks.find(cb => cb.id === id);
    setCheckbooks(prev => prev.filter(cb => cb.id !== id));
    if (checkbook) {
      setBankAccounts(prev => prev.map(a =>
        a.id === checkbook.bankAccountId
          ? { ...a, checkbooksCount: Math.max(0, a.checkbooksCount - 1) }
          : a
      ));
    }
  }, [checkbooks]);

  const addCheck = useCallback((data: {
    bankAccountId: string; checkbookId?: string; type: CheckType; number: string; partnerId: string;
    partnerName: string; emissionDate: string; dueDate: string; amount: number; facture?: string; note?: string
  }) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(data.dueDate + "T00:00:00");
    let status: CheckStatus = "En Circulation";
    if (due < now) status = "En Retard";

    const newCheck: Check = {
      id: `ch_${Date.now()}`,
      bankAccountId: data.bankAccountId,
      checkbookId: data.checkbookId,
      type: data.type,
      number: data.number,
      partnerId: data.partnerId,
      partnerName: data.partnerName,
      emissionDate: data.emissionDate,
      dueDate: data.dueDate,
      amount: data.amount,
      status,
      facture: data.facture,
      note: data.note,
    };
    setChecks(prev => [...prev, newCheck]);

    if (data.checkbookId) {
      setCheckbooks(prev => prev.map(c =>
        c.id === data.checkbookId ? { ...c, remaining: Math.max(0, c.remaining - 1) } : c
      ));
    }
  }, []);

  const updateCheck = useCallback((id: string, data: Partial<Omit<Check, 'id' | 'checkbookId'>>) => {
    setChecks(prev => prev.map(c => {
      if (c.id !== id) return c;
      const updated = { ...c, ...data };
      if (data.dueDate && (updated.status === "En Circulation" || updated.status === "En Retard")) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(updated.dueDate + "T00:00:00");
        updated.status = due < today ? "En Retard" : "En Circulation";
      }
      return updated;
    }));
  }, []);

  const updateCheckStatus = useCallback((id: string, status: CheckStatus) => {
    setChecks(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  }, []);

  const updateBankAccount = useCallback((id: string, data: { bankName: string; rib: string }) => {
    setBankAccounts(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    setCheckbooks(prev => prev.map(cb => cb.bankAccountId === id ? { ...cb, bankName: data.bankName } : cb));
  }, []);

  const deleteCheck = useCallback((id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce chèque ?")) return;
    setChecks(prev => prev.filter(c => c.id !== id));
  }, []);

  const addPartnerListItem = useCallback((data: Omit<PartnerListItem, "id">) => {
    setPartnerList(prev => {
      const newId = prev.length > 0 ? Math.max(...prev.map(p => p.id)) + 1 : 1;
      return [...prev, { ...data, id: newId }];
    });
  }, []);

  const updatePartnerListItem = useCallback((id: number, data: Partial<PartnerListItem>) => {
    setPartnerList(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  }, []);

  const deletePartnerListItem = useCallback((id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce partenaire ?")) return;
    setPartnerList(prev => prev.filter(p => p.id !== id));
  }, []);

  const addUser = useCallback((data: Omit<User, "id">) => {
    setUsers(prev => {
      const newId = prev.length > 0 ? Math.max(...prev.map(u => u.id)) + 1 : 1;
      return [...prev, { ...data, id: newId }];
    });
  }, []);

  const updateUser = useCallback((id: number, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  }, []);

  const deleteUser = useCallback((id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  const toggleUserStatus = useCallback((id: number) => {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === "Actif" ? "Inactif" : "Actif" } : u
    ));
  }, []);

  return (
    <AppContext.Provider value={{
      bankAccounts, checkbooks, checks, partnerList, users,
      currentUser, isAuthenticated, login, logout,
      addBankAccount, deleteBankAccount,
      addCheckbook, deleteCheckbook,
      addCheck, updateCheck, updateCheckStatus, deleteCheck,
      updateBankAccount,
      addPartnerListItem, updatePartnerListItem, deletePartnerListItem,
      addUser, updateUser, deleteUser, toggleUserStatus,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
