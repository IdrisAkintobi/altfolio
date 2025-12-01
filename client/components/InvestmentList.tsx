import React from 'react';
import { InvestmentWithAsset, UserRole } from '@shared/types';
import { formatCurrency, formatDate } from '../lib/utils';
import { DropdownMenu } from './ui/DropdownMenu';
import { Table, Column } from './ui/Table';
import { Trash2, Eye } from 'lucide-react';

interface InvestmentListProps {
  investments: InvestmentWithAsset[];
  userRole: UserRole;
  onDelete: (id: string) => void;
  onView?: (investment: InvestmentWithAsset) => void;
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export const InvestmentList: React.FC<InvestmentListProps> = ({
  investments,
  userRole,
  onDelete,
  onView,
  currentPage,
  totalPages,
  total,
  onPageChange,
  onNextPage,
  onPrevPage,
}) => {
  const columns: Column<InvestmentWithAsset>[] = [
    {
      key: 'assetName',
      header: 'Asset Name',
      render: (inv) => <span className="font-medium text-white">{inv.asset.assetName}</span>,
    },
    {
      key: 'assetType',
      header: 'Type',
      render: (inv) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          {inv.asset.assetType}
        </span>
      ),
    },
    {
      key: 'investedAmount',
      header: 'Invested',
      align: 'right',
      render: (inv) => <span className="text-slate-300">{formatCurrency(inv.investedAmount)}</span>,
    },
    {
      key: 'currentValue',
      header: 'Current Value',
      align: 'right',
      render: (inv) => (
        <span className="text-white font-medium">{formatCurrency(inv.currentValue)}</span>
      ),
    },
    {
      key: 'gainLoss',
      header: 'Gain/Loss',
      align: 'right',
      render: (inv) => {
        const gain = inv.currentValue - inv.investedAmount;
        const isPositive = gain >= 0;
        return (
          <span className={`font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}
            {formatCurrency(gain)}
          </span>
        );
      },
    },
    {
      key: 'investmentDate',
      header: 'Date Invested',
      render: (inv) => <span className="text-slate-400">{formatDate(inv.investmentDate)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (inv) => (
        <div className="flex items-center justify-end">
          <DropdownMenu
            items={[
              ...(onView
                ? [
                    {
                      label: 'View Details',
                      icon: <Eye className="w-4 h-4" />,
                      onClick: () => onView(inv),
                    },
                  ]
                : []),
              ...(userRole === UserRole.ADMIN
                ? [
                    {
                      label: 'Delete',
                      icon: <Trash2 className="w-4 h-4" />,
                      onClick: () => onDelete(inv.id),
                      className: 'text-red-400',
                    },
                  ]
                : []),
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-slate-400">
          Showing {investments.length} of {total} investments
        </div>
      </div>

      <Table
        data={investments}
        columns={columns}
        emptyMessage="No investments found matching your criteria."
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onNextPage={onNextPage}
        onPrevPage={onPrevPage}
        getRowKey={(inv) => inv.id}
      />
    </div>
  );
};
