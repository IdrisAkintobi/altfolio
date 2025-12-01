import React from 'react';
import { InvestmentStats } from '../components/InvestmentStats';
import { useInvestmentsQuery } from '../hooks/queries/useInvestmentsQuery';
import { Loader2 } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { data, isLoading } = useInvestmentsQuery(1, 1000);
  const investments = data?.data || [];

  return (
    <>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Portfolio Overview
        </h1>
        <p className="text-slate-400 mt-1 text-sm sm:text-base">
          Track performance and allocation across all asset classes.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <InvestmentStats investments={investments} />
      )}
    </>
  );
};
