import { X } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";

export type UserRole = "Administrateur" | "Comptable" | "Agent de saisie";
export type UserStatus = "Actif" | "Inactif";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, "id">) => void;
  editUser?: User | null;
}

export function NewUserModal({ isOpen, onClose, onSave, editUser }: NewUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Agent de saisie");
  const [status, setStatus] = useState<UserStatus>("Actif");

  useEffect(() => {
    if (editUser) {
      setName(editUser.name);
      setEmail(editUser.email);
      setRole(editUser.role);
      setStatus(editUser.status);
    } else {
      setName("");
      setEmail("");
      setRole("Agent de saisie");
      setStatus("Actif");
    }
  }, [editUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ name, email, role, status });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[12px] shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-[16px] font-bold text-slate-900 m-0">{editUser ? "Modifier Utilisateur" : "Nouvel Utilisateur"}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-[6px] hover:bg-slate-50 border-none bg-transparent cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1">Nom complet</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Hatim Lk" 
                className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                required 
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: email@gadimat.ma" 
                className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                required 
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1">Rôle</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value as UserRole)} 
                className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                required
              >
                <option value="Administrateur">Administrateur</option>
                <option value="Comptable">Comptable</option>
                <option value="Agent de saisie">Agent de saisie</option>
              </select>
            </div>
            {editUser && (
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">Statut</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value as UserStatus)} 
                  className="w-full px-3 py-2 border border-slate-200 rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                  required
                >
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>
            )}
            
            {/* Footer */}
            <div className="pt-4 flex justify-end gap-3 mt-6">
              <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-[6px] hover:bg-slate-50 transition cursor-pointer">
                Annuler
              </button>
              <button type="submit" className="px-4 py-2 text-[13px] font-semibold text-white bg-primary rounded-[6px] hover:bg-emerald-600 transition border-none cursor-pointer">
                {editUser ? "Sauvegarder" : "Créer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
