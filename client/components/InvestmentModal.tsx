import React, { useState, useEffect } from 'react';
import { Asset } from '@shared/types';
import { Button } from './ui/Button';
import { X, Loader2, TrendingUp } from 'lucide-react';
import { useInvestmentsQuery } from '../hooks/queries/useInvestmentsQuery';
import { formatCurrency } from '../lib/utils';

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (investment: {
    assetId: string;
    investedAmount: number;
    investmentDate: string;
  }) => Promise<void>;
  assets: Asset[];
  preSelectedAssetId?: string | null;
}

export const InvestmentModal: React.FC<InvestmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  assets,
  preSelectedAssetId,
}) => {
  const { data, isLoading, refetch } = useInvestmentsQuery(1, 1000);
  const investments = data?.data || [];

  const [formData, setFormData] = useState({
    assetId: '',
    investedAmount: 0,
    investmentDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      refetch();
      setFormData({
        assetId: preSelectedAssetId || (assets.length > 0 ? assets[0].id : ''),
        investedAmount: 0,
        investmentDate: new Date().toISOString().split('T')[0],
      });
      setError(null);
    }
  }, [isOpen, assets, preSelectedAssetId, refetch]);

  if (!isOpen) return null;

  const selectedAsset = assets.find((a) => a.id === formData.assetId);

  // Calculate existing investments for this asset
  const existingInvestments = investments.filter((inv) => inv.assetId === formData.assetId);
  const totalInvested = existingInvestments.reduce((sum, inv) => sum + inv.investedAmount, 0);
  const totalCurrentValue = existingInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save investment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">Invest in Asset</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Selected Asset Display */}
          {selectedAsset && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedAsset.assetName}</h3>
                  <p className="text-sm text-slate-400 mt-1">{selectedAsset.assetType}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Current Performance</div>
                  <div
                    className={`text-lg font-semibold ${
                      selectedAsset.currentPerformance >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {selectedAsset.currentPerformance >= 0 ? '+' : ''}
                    {selectedAsset.currentPerformance.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Existing Investments Summary */}
          {isLoading ? (
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              <span className="ml-2 text-sm text-indigo-300">Loading your investments...</span>
            </div>
          ) : existingInvestments.length > 0 ? (
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-medium text-indigo-300">Your Existing Investments</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-400">Total Invested</div>
                  <div className="text-lg font-semibold text-white">
                    {formatCurrency(totalInvested)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Current Worth</div>
                  <div className="text-lg font-semibold text-emerald-400">
                    {formatCurrency(totalCurrentValue)}
                  </div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-indigo-500/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Gain/Loss:</span>
                  <span
                    className={`font-medium ${
                      totalCurrentValue - totalInvested >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {totalCurrentValue - totalInvested >= 0 ? '+' : ''}
                    {formatCurrency(totalCurrentValue - totalInvested)}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Investment Amount ($)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={formData.investedAmount}
                onChange={(e) =>
                  setFormData({ ...formData, investedAmount: Number(e.target.value) })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Investment Date</label>
              <input
                required
                type="date"
                value={formData.investmentDate}
                onChange={(e) => setFormData({ ...formData, investmentDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {existingInvestments.length > 0 ? 'Add to Investment' : 'Create Investment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
