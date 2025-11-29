import React, { useState } from 'react';
import { Investment, UserRole, AssetType } from '../../shared/types';
import { formatCurrency, formatDate } from '../lib/utils';
import { Button } from './ui/Button';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';
import { ASSET_TYPES } from '../../shared/constants';

interface InvestmentListProps {
  investments: Investment[];
  userRole: UserRole;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onAdd: () => void;
}

export const InvestmentList: React.FC<InvestmentListProps> = ({ 
  investments, 
  userRole, 
  onDelete,
  onEdit,
  onAdd
}) => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredInvestments = investments.filter(inv => {
    const matchesType = filter === 'All' || inv.assetType === filter;
    const matchesSearch = inv.assetName.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Types</option>
            {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {userRole === UserRole.ADMIN && (
          <Button onClick={onAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Investment
          </Button>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Asset Name</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium text-right">Invested</th>
                <th className="px-6 py-4 font-medium text-right">Current Value</th>
                <th className="px-6 py-4 font-medium text-right">Gain/Loss</th>
                <th className="px-6 py-4 font-medium">Date Invested</th>
                {userRole === UserRole.ADMIN && <th className="px-6 py-4 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredInvestments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No investments found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredInvestments.map((inv) => {
                  const gain = inv.currentValue - inv.investedAmount;
                  const isPositive = gain >= 0;
                  
                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{inv.assetName}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {inv.assetType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-right">{formatCurrency(inv.investedAmount)}</td>
                      <td className="px-6 py-4 text-white font-medium text-right">{formatCurrency(inv.currentValue)}</td>
                      <td className={`px-6 py-4 text-right font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{formatCurrency(gain)}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{formatDate(inv.investmentDate)}</td>
                      {userRole === UserRole.ADMIN && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => onEdit(inv.id)} className="h-8 w-8 p-0">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onDelete(inv.id)} className="h-8 w-8 p-0 text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};