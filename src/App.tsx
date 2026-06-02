import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { BankAccounts } from "./pages/BankAccounts";
import { IssuedChecks } from "./pages/IssuedChecks";
import { Checkbooks } from "./pages/Checkbooks";
import { Calendar } from "./pages/Calendar";

// Placeholder components for other routes
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full text-slate-500">
    <div className="text-center space-y-2">
      <div className="text-[18px] font-bold text-slate-900">{title}</div>
      <p className="text-[13px]">Ce module est en cours de développement.</p>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="comptes" element={<BankAccounts />} />
          <Route path="emis" element={<IssuedChecks />} />
          <Route path="roles" element={<Placeholder title="Rôles & Permissions" />} />
          <Route path="carnets" element={<Checkbooks />} />
          <Route path="recus" element={<Placeholder title="Chèques Reçus" />} />
          <Route path="calendrier" element={<Calendar />} />
          <Route path="partenaires" element={<Placeholder title="Partenaires" />} />
          <Route path="chat" element={<Placeholder title="Support Chat" />} />
          <Route path="billing" element={<Placeholder title="Abonnement" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
