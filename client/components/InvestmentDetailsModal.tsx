import React from 'react';
import { InvestmentWithAsset } from '../../shared/types';
import { X, User as UserIcon, Mail, Calendar, DollarSign, TrendingUp, Briefcase, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { useUserQuery } from '../hooks/queries/useUsersQuery';

interface InvestmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  investment: InvestmentWithAsset | null;
  isAdmin?: boolean;
}

export const InvestmentDetailsModal: React.FC<InvestmentDetailsModalProps> = ({
  isOpen,
  onClose,
  investment,
  isAdmin = false,
}) => {
  // userId might be populated as an object or just a string ID
  const userId = investment?.userId;
  const userIdString = typeof userId === 'string' ? userId : (userId as any)?.id || '';
  
  const { data: user, isLoading: isLoadingUser } = useUserQuery(
    isAdmin && userIdString ? userIdString : ''
  );
  
  // If userId is already populated, use it directly
  const populatedUser = typeof userId === 'object' ? userId : null;

  if (!isOpen || !investment) return null;

  const gain = investment.currentValue - investment.investedAmount;
  const gainPercentage = ((gain / investment.investedAmount) * 100).toFixed(2);
  const isPositive = gain >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-800 flex-shrink-0">
          <h2 className="text-xl font-semibold text-white">Investment Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Asset Information */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">Asset Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-400">Asset Name</div>
                <div className="text-sm font-medium text-white mt-1">{investment.asset.assetName}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Asset Type</div>
                <div className="text-sm font-medium text-white mt-1">{investment.asset.assetType}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Current Performance</div>
                <div className={`text-sm font-medium mt-1 ${
                  investment.asset.currentPerformance >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {investment.asset.currentPerformance >= 0 ? '+' : ''}{investment.asset.currentPerformance.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Performance at Investment</div>
                <div className="text-sm font-medium text-slate-300 mt-1">
                  {investment.assetPerformanceAtInvestment.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Investment Details */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Investment Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-400">Invested Amount</div>
                <div className="text-lg font-semibold text-white mt-1">
                  {formatCurrency(investment.investedAmount)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Current Value</div>
                <div className="text-lg font-semibold text-emerald-400 mt-1">
                  {formatCurrency(investment.currentValue)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Gain/Loss</div>
                <div className={`text-lg font-semibold mt-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{formatCurrency(gain)} ({isPositive ? '+' : ''}{gainPercentage}%)
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Investment Date</div>
                <div className="text-sm font-medium text-slate-300 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(investment.investmentDate)}
                </div>
              </div>
            </div>
          </div>

          {/* User Information (Admin only) */}
          {isAdmin && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <UserIcon className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Investor Information</h3>
              </div>
              {populatedUser ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">Name:</span>
                    <span className="text-white font-medium">{(populatedUser as any).name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">Email:</span>
                    <span className="text-white">{(populatedUser as any).email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400">Role:</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      (populatedUser as any).role === 'admin' 
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {(populatedUser as any).role}
                    </span>
                  </div>
                  {(populatedUser as any).createdAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-400">Joined:</span>
                      <span className="text-white">{formatDate((populatedUser as any).createdAt)}</span>
                    </div>
                  )}
                </div>
              ) : isLoadingUser ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                </div>
              ) : user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">Name:</span>
                    <span className="text-white font-medium">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">Email:</span>
                    <span className="text-white">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400">Role:</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      user.role === 'admin' 
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  {user.createdAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-400">Joined:</span>
                      <span className="text-white">{formatDate(user.createdAt)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-slate-400">Failed to load user information</div>
              )}
            </div>
          )}

          {/* Performance Summary */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-semibold text-indigo-300">Performance Summary</h3>
            </div>
            <p className="text-sm text-slate-300">
              This investment has {isPositive ? 'gained' : 'lost'} {' '}
              <span className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {Math.abs(parseFloat(gainPercentage))}%
              </span>
              {' '}since the investment date. The asset's performance has changed from{' '}
              <span className="font-semibold text-white">
                {investment.assetPerformanceAtInvestment.toFixed(2)}%
              </span>
              {' '}to{' '}
              <span className="font-semibold text-white">
                {investment.asset.currentPerformance.toFixed(2)}%
              </span>.
            </p>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-slate-800 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
