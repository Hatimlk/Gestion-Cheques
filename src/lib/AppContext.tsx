import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { BankAccount, Checkbook, Check, CheckStatus, CheckType, Instance } from "./types";
import { api } from "./api";

export type UserRole = "Administrateur" | "Utilisateur";
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

interface AppContextType {
  bankAccounts: BankAccount[];
  checkbooks: Checkbook[];
  checks: Check[];
  partnerList: PartnerListItem[];
  instances: Instance[];
  users: User[];
  currentUser: User | null;
  isAuthenticated: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  addBankAccount: (data: { bankName: string; rib: string }) => Promise<void>;
  deleteBankAccount: (id: string) => Promise<void>;
  updateBankAccount: (id: string, data: { bankName: string; rib: string }) => Promise<void>;
  addCheckbook: (data: { bankAccountId: string; bankName: string; type: CheckType; startNumber: string; endNumber: string }) => Promise<void>;
  deleteCheckbook: (id: string) => Promise<void>;
  addCheck: (data: { bankAccountId: string; checkbookId?: string; type: CheckType; number: string; partnerId: string; partnerName: string; emissionDate: string; dueDate: string; amount: number; facture?: string; note?: string }) => Promise<void>;
  updateCheck: (id: string, data: Partial<Omit<Check, 'id' | 'checkbookId'>>) => Promise<void>;
  updateCheckStatus: (id: string, status: CheckStatus) => Promise<void>;
  deleteCheck: (id: string) => Promise<void>;
  addPartnerListItem: (data: Omit<PartnerListItem, "id">) => Promise<void>;
  updatePartnerListItem: (id: number, data: Partial<PartnerListItem>) => Promise<void>;
  deletePartnerListItem: (id: number) => Promise<void>;
  addInstance: (data: Omit<Instance, "id">) => Promise<void>;
  updateInstance: (id: number, data: Partial<Instance>) => Promise<void>;
  deleteInstance: (id: number) => Promise<void>;
  addUser: (data: Omit<User, "id"> & { password: string }) => Promise<void>;
  updateUser: (id: number, data: Partial<User> & { password?: string }) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  toggleUserStatus: (id: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

async function loadAll() {
  return Promise.all([
    api.get<BankAccount[]>('/bank-accounts'),
    api.get<Checkbook[]>('/checkbooks'),
    api.get<Check[]>('/checks'),
    api.get<PartnerListItem[]>('/partners'),
    api.get<User[]>('/users'),
    api.get<Instance[]>('/instances'),
  ]);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [checkbooks, setCheckbooks] = useState<Checkbook[]>([]);
  const [checks, setChecks] = useState<Check[]>([]);
  const [partnerList, setPartnerList] = useState<PartnerListItem[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const isAuthenticated = currentUser !== null;

  // Restore authentication check and data loading
  useEffect(() => {
    const initialize = async () => {
      const token = localStorage.getItem('gadimat_token');
      if (token) {
        try {
          const user = await api.get<User>('/auth/me');
          setCurrentUser(user);
          const [accounts, books, chks, partners, allUsers, allInstances] = await loadAll();
          setBankAccounts(accounts);
          setCheckbooks(books);
          setChecks(chks);
          setPartnerList(partners);
          setUsers(allUsers);
          setInstances(allInstances);
        } catch (err) {
          console.error("Authentication failed:", err);
          localStorage.removeItem('gadimat_token');
          setCurrentUser(null);
        }
      }
      setInitialized(true);
    };

    initialize();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      const { token, user } = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
      localStorage.setItem('gadimat_token', token);
      setCurrentUser(user);
      const [accounts, books, chks, partners, allUsers, allInstances] = await loadAll();
      setBankAccounts(accounts);
      setCheckbooks(books);
      setChecks(chks);
      setPartnerList(partners);
      setUsers(allUsers);
      setInstances(allInstances);
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Erreur de connexion';
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('gadimat_token');
    setCurrentUser(null);
    setBankAccounts([]);
    setCheckbooks([]);
    setChecks([]);
    setPartnerList([]);
    setUsers([]);
    setInstances([]);
  }, []);

  // Bank accounts
  const addBankAccount = useCallback(async (data: { bankName: string; rib: string }) => {
    try {
      const account = await api.post<BankAccount>('/bank-accounts', data);
      setBankAccounts(prev => [...prev, account]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de l\'ajout du compte.');
    }
  }, []);

  const deleteBankAccount = useCallback(async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce compte bancaire ? Tous les carnets et chèques associés seront supprimés.")) return;
    try {
      await api.delete(`/bank-accounts/${id}`);
      setBankAccounts(prev => prev.filter(a => a.id !== id));
      setCheckbooks(prev => prev.filter(cb => cb.bankAccountId !== id));
      setChecks(prev => prev.filter(c => c.bankAccountId !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    }
  }, []);

  const updateBankAccount = useCallback(async (id: string, data: { bankName: string; rib: string }) => {
    try {
      await api.put(`/bank-accounts/${id}`, data);
      setBankAccounts(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
      setCheckbooks(prev => prev.map(cb => cb.bankAccountId === id ? { ...cb, bankName: data.bankName } : cb));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    }
  }, []);

  // Checkbooks
  const addCheckbook = useCallback(async (data: { bankAccountId: string; bankName: string; type: CheckType; startNumber: string; endNumber: string }) => {
    try {
      const book = await api.post<Checkbook>('/checkbooks', data);
      setCheckbooks(prev => [...prev, book]);
      setBankAccounts(prev => prev.map(a =>
        a.id === data.bankAccountId ? { ...a, checkbooksCount: a.checkbooksCount + 1 } : a
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de l\'ajout du carnet.');
    }
  }, []);

  const deleteCheckbook = useCallback(async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce carnet ?")) return;
    try {
      const book = checkbooks.find(cb => cb.id === id);
      await api.delete(`/checkbooks/${id}`);
      setCheckbooks(prev => prev.filter(cb => cb.id !== id));
      if (book) {
        setBankAccounts(prev => prev.map(a =>
          a.id === book.bankAccountId ? { ...a, checkbooksCount: Math.max(0, a.checkbooksCount - 1) } : a
        ));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    }
  }, [checkbooks]);

  // Checks
  const addCheck = useCallback(async (data: {
    bankAccountId: string; checkbookId?: string; type: CheckType; number: string;
    partnerId: string; partnerName: string; emissionDate: string; dueDate: string;
    amount: number; facture?: string; note?: string;
  }) => {
    try {
      const check = await api.post<Check>('/checks', data);
      setChecks(prev => [check, ...prev]);
      if (data.checkbookId) {
        setCheckbooks(prev => prev.map(cb =>
          cb.id === data.checkbookId ? { ...cb, remaining: Math.max(0, cb.remaining - 1) } : cb
        ));
      }
      if (check.status === 'Payé' && check.facture) {
        setInstances(insts => insts.map(inst => {
          if (inst.facture === check.facture) {
            return { ...inst, paymentDate: check.dueDate };
          }
          return inst;
        }));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de l\'ajout du chèque.');
    }
  }, []);

  const updateCheck = useCallback(async (id: string, data: Partial<Omit<Check, 'id' | 'checkbookId'>>) => {
    try {
      const result = await api.put<{ success: boolean; status: CheckStatus }>(`/checks/${id}`, data);
      setChecks(prev => prev.map(c => {
        if (c.id === id) {
          const updated = { ...c, ...data, status: result.status };
          const finalFacture = updated.facture || c.facture;
          if (finalFacture) {
            setInstances(insts => insts.map(inst => {
              if (inst.facture === finalFacture) {
                if (updated.status === 'Payé') {
                  return { ...inst, paymentDate: updated.dueDate };
                } else if (c.status === 'Payé') {
                  return { ...inst, paymentDate: null };
                }
              }
              return inst;
            }));
          }
          return updated;
        }
        return c;
      }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    }
  }, []);

  const updateCheckStatus = useCallback(async (id: string, status: CheckStatus) => {
    try {
      await api.patch(`/checks/${id}/status`, { status });
      setChecks(prev => prev.map(c => {
        if (c.id === id) {
          if (c.facture) {
            setInstances(insts => insts.map(inst => {
              if (inst.facture === c.facture) {
                if (status === 'Payé') {
                  return { ...inst, paymentDate: c.dueDate };
                } else if (c.status === 'Payé') {
                  return { ...inst, paymentDate: null };
                }
              }
              return inst;
            }));
          }
          return { ...c, status };
        }
        return c;
      }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut.');
    }
  }, []);

  const deleteCheck = useCallback(async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce chèque ?")) return;
    try {
      await api.delete(`/checks/${id}`);
      setChecks(prev => {
        const check = prev.find(c => c.id === id);
        if (check && check.status === 'Payé' && check.facture) {
          setInstances(insts => insts.map(inst => {
            if (inst.facture === check.facture) {
              return { ...inst, paymentDate: null };
            }
            return inst;
          }));
        }
        return prev.filter(c => c.id !== id);
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    }
  }, []);

  // Partners
  const addPartnerListItem = useCallback(async (data: Omit<PartnerListItem, "id">) => {
    try {
      const partner = await api.post<PartnerListItem>('/partners', data);
      setPartnerList(prev => [...prev, partner]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de l\'ajout du partenaire.');
    }
  }, []);

  const updatePartnerListItem = useCallback(async (id: number, data: Partial<PartnerListItem>) => {
    try {
      await api.put(`/partners/${id}`, data);
      setPartnerList(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    }
  }, []);

  const deletePartnerListItem = useCallback(async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce partenaire ?")) return;
    try {
      await api.delete(`/partners/${id}`);
      setPartnerList(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    }
  }, []);

  // Users
  const addUser = useCallback(async (data: Omit<User, "id"> & { password: string }) => {
    try {
      const user = await api.post<User>('/users', data);
      setUsers(prev => [...prev, user]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de l\'ajout de l\'utilisateur.');
    }
  }, []);

  const updateUser = useCallback(async (id: number, data: Partial<User> & { password?: string }) => {
    try {
      await api.put(`/users/${id}`, data);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    }
  }, []);

  const deleteUser = useCallback(async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    }
  }, []);

  const toggleUserStatus = useCallback(async (id: number) => {
    try {
      await api.patch(`/users/${id}/toggle-status`);
      setUsers(prev => prev.map(u =>
        u.id === id ? { ...u, status: u.status === "Actif" ? "Inactif" : "Actif" } : u
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    }
  }, []);

  // Instances
  const addInstance = useCallback(async (data: Omit<Instance, "id">) => {
    try {
      const instance = await api.post<Instance>('/instances', data);
      setInstances(prev => [instance, ...prev]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de l\'ajout de la facture en instance.');
    }
  }, []);

  const updateInstance = useCallback(async (id: number, data: Partial<Instance>) => {
    try {
      await api.put(`/instances/${id}`, data);
      setInstances(prev => prev.map(inst => inst.id === id ? { ...inst, ...data } : inst));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    }
  }, []);

  const deleteInstance = useCallback(async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette facture en instance ?")) return;
    try {
      await api.delete(`/instances/${id}`);
      setInstances(prev => prev.filter(inst => inst.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    }
  }, []);

  return (
    <AppContext.Provider value={{
      bankAccounts, checkbooks, checks, partnerList, instances, users,
      currentUser, isAuthenticated, initialized,
      login, logout,
      addBankAccount, deleteBankAccount, updateBankAccount,
      addCheckbook, deleteCheckbook,
      addCheck, updateCheck, updateCheckStatus, deleteCheck,
      addPartnerListItem, updatePartnerListItem, deletePartnerListItem,
      addInstance, updateInstance, deleteInstance,
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
