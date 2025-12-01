import React, { useState, useEffect } from 'react';
import { Asset, AssetType } from '@shared/types';
import { ASSET_TYPES } from '@shared/constants';
import { Button } from './ui/Button';
import { X, Loader2 } from 'lucide-react';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: {
    assetName: string;
    assetType: AssetType;
    currentPerformance: number;
  }) => Promise<void>;
  initialData?: Asset;
}

export const AssetModal: React.FC<AssetModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    assetName: '',
    assetType: AssetType.STARTUP as AssetType,
    currentPerformance: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        assetName: initialData.assetName,
        assetType: initialData.assetType,
        currentPerformance: initialData.currentPerformance,
      });
    } else {
      setFormData({
        assetName: '',
        assetType: AssetType.STARTUP,
        currentPerformance: 0,
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">
            {initialData ? 'Edit Asset' : 'New Asset'}
          </h2>
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Asset Name</label>
            <input
              required
              type="text"
              value={formData.assetName}
              onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., SpaceX Series N"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Asset Type</label>
            <select
              value={formData.assetType}
              onChange={(e) => setFormData({ ...formData, assetType: e.target.value as AssetType })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {ASSET_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Current Performance (%)</label>
            <input
              required
              type="number"
              step="0.01"
              value={formData.currentPerformance}
              onChange={(e) =>
                setFormData({ ...formData, currentPerformance: Number(e.target.value) })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., 25.5"
            />
            <p className="text-xs text-slate-500">Positive for gains, negative for losses</p>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {initialData ? 'Update' : 'Create'} Asset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
