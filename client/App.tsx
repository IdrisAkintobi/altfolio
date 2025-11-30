import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthForm } from "./components/AuthForm";
import { Layout } from "./components/Layout";
import { DashboardPage, InvestmentsPage, AssetsPage, UsersPage } from "./pages";
import { useAuth } from "./contexts/AuthContext";
import { queryClient } from "./lib/query-client";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "./components/ErrorBoundary";

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {!isAuthenticated ? (
        <>
          <Route path="/" element={<AuthForm />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
          <Route path="/investments" element={<Layout><InvestmentsPage /></Layout>} />
          <Route path="/assets" element={<Layout><AssetsPage /></Layout>} />
          <Route path="/users" element={<Layout><UsersPage /></Layout>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      )}
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
