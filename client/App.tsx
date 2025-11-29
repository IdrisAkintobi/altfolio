import React, { useState } from "react";
import { MOCK_INVESTMENTS } from "../shared/constants";
import { Investment, UserRole } from "../shared/types";
import { AuthForm } from "./components/AuthForm";
import { InvestmentList } from "./components/InvestmentList";
import { InvestmentModal } from "./components/InvestmentModal";
import { InvestmentStats } from "./components/InvestmentStats";
import { Layout } from "./components/Layout";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.VIEWER);
  const [currentPath, setCurrentPath] = useState("dashboard");
  const [investments, setInvestments] =
    useState<Investment[]>(MOCK_INVESTMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(UserRole.VIEWER);
  };

  const handleSaveInvestment = (data: Omit<Investment, "id" | "updatedAt">) => {
    if (editingId) {
      setInvestments((prev) =>
        prev.map((inv) =>
          inv.id === editingId
            ? { ...data, id: editingId, updatedAt: new Date().toISOString() }
            : inv
        )
      );
    } else {
      const newInvestment: Investment = {
        ...data,
        id: Math.random().toString(36).substring(2, 9),
        updatedAt: new Date().toISOString(),
      };
      setInvestments((prev) => [...prev, newInvestment]);
    }
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this asset?")) {
      setInvestments((prev) => prev.filter((inv) => inv.id !== id));
    }
  };

  const openEditModal = (id: string) => {
    setEditingId(id);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setIsModalOpen(true);
  };

  if (!isAuthenticated) {
    return <AuthForm onLogin={handleLogin} />;
  }

  return (
    <>
      <Layout
        userRole={userRole}
        currentPath={currentPath}
        onNavigate={setCurrentPath}
        onLogout={handleLogout}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {currentPath === "dashboard"
              ? "Portfolio Overview"
              : "Investment Assets"}
          </h1>
          <p className="text-slate-400 mt-1">
            {currentPath === "dashboard"
              ? "Track performance and allocation across all asset classes."
              : "Manage your alternative investment entries."}
          </p>
        </div>

        {currentPath === "dashboard" ? (
          <InvestmentStats investments={investments} />
        ) : (
          <InvestmentList
            investments={investments}
            userRole={userRole}
            onDelete={handleDelete}
            onEdit={openEditModal}
            onAdd={openAddModal}
          />
        )}
      </Layout>

      <InvestmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveInvestment}
        initialData={
          editingId ? investments.find((i) => i.id === editingId) : undefined
        }
      />
    </>
  );
};

export default App;
