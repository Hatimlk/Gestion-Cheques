import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { LogIn } from "lucide-react";

export function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = login(email);
    if (result) {
      setError(result);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="bg-white rounded-[16px] border border-slate-200 shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-[40px] block mb-3">🏦</span>
          <h1 className="text-[20px] font-extrabold text-slate-900">Gadimat Chèques</h1>
          <p className="text-[12px] text-slate-500 mt-1">Connectez-vous pour continuer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gadimat.ma"
              required
              className="w-full px-3 py-2.5 border border-slate-200 rounded-[8px] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] px-3 py-2 rounded-[6px]">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-[8px] text-[13px] font-semibold hover:bg-slate-800 transition shadow-sm border-none cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            Se connecter
          </button>
        </form>

      </div>
    </div>
  );
}
