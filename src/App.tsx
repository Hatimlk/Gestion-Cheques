import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/lib/AppContext";
import { Layout } from "./components/layout/Layout";

// Login restored
const Dashboard = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.Dashboard })));
const BankAccounts = lazy(() => import("./pages/BankAccounts").then(m => ({ default: m.BankAccounts })));
const IssuedChecks = lazy(() => import("./pages/IssuedChecks").then(m => ({ default: m.IssuedChecks })));
const Calendar = lazy(() => import("./pages/Calendar").then(m => ({ default: m.Calendar })));
const Partners = lazy(() => import("./pages/Partners").then(m => ({ default: m.Partners })));
const Roles = lazy(() => import("./pages/Roles").then(m => ({ default: m.Roles })));
const PrintModule = lazy(() => import("./pages/PrintModule").then(m => ({ default: m.PrintModule })));
const Guide = lazy(() => import("./pages/Guide").then(m => ({ default: m.Guide })));
const RegleChecks = lazy(() => import("./pages/RegleChecks").then(m => ({ default: m.RegleChecks })));
const Instances = lazy(() => import("./pages/Instances").then(m => ({ default: m.Instances })));
const LoginPage = lazy(() => import("./pages/LoginPage").then(m => ({ default: m.LoginPage })));

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, initialized } = useApp();
  
  if (!initialized) return <LoadingFallback />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { currentUser, initialized } = useApp();
  
  if (!initialized) return <LoadingFallback />;
  if (currentUser?.role !== "Administrateur") return <Navigate to="/" replace />;
  
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/login" element={<Suspense fallback={<LoadingFallback />}><LoginPage /></Suspense>} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Suspense fallback={<LoadingFallback />}><Dashboard /></Suspense>} />
            <Route path="comptes" element={<Suspense fallback={<LoadingFallback />}><BankAccounts /></Suspense>} />
            {/* <Route path="emis" element={<Suspense fallback={<LoadingFallback />}><IssuedChecks /></Suspense>} /> */}
            <Route path="regles" element={<Suspense fallback={<LoadingFallback />}><RegleChecks /></Suspense>} />
            <Route path="instances" element={<Suspense fallback={<LoadingFallback />}><Instances /></Suspense>} />
            <Route path="impression" element={<Suspense fallback={<LoadingFallback />}><PrintModule /></Suspense>} />
            <Route path="roles" element={<Suspense fallback={<LoadingFallback />}><AdminRoute><Roles /></AdminRoute></Suspense>} />
            <Route path="calendrier" element={<Suspense fallback={<LoadingFallback />}><Calendar /></Suspense>} />
            <Route path="partenaires" element={<Suspense fallback={<LoadingFallback />}><Partners /></Suspense>} />
            <Route path="guide" element={<Suspense fallback={<LoadingFallback />}><Guide /></Suspense>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}
