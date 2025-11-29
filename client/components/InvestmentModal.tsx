import React, { useState, useEffect } from 'react';
import { Investment, AssetType } from '../../shared/types';
import { ASSET_TYPES } from '../../shared/constants';
import { Button } from './ui/Button';
import { X } from 'lucide-react';

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (investment: Omit<Investment, 'id' | 'updatedAt'>) => void;
  initialData?: Investment;
}

export const InvestmentModal: React.FC<InvestmentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}) => {
  const [formData, setFormData] = useState({
    assetName: '',
    assetType: AssetType.STARTUP as AssetType,
    investedAmount: 0,
    currentValue: 0,
    investmentDate: '',
    owners: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        assetName: initialData.assetName,
        assetType: initialData.assetType,
        investedAmount: initialData.investedAmount,
        currentValue: initialData.currentValue,
        investmentDate: initialData.investmentDate.split('T')[0],
        owners: initialData.owners.join(', '),
      });
    } else {
      setFormData({
        assetName: '',
        assetType: AssetType.STARTUP,
        investedAmount: 0,
        currentValue: 0,
        investmentDate: new Date().toISOString().split('T')[0],
        owners: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      owners: formData.owners.split(',').map(s => s.trim()).filter(Boolean),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">
            {initialData ? 'Edit Investment' : 'New Investment'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Asset Name</label>
            <input
              required
              type="text"
              value={formData.assetName}
              onChange={e => setFormData({...formData, assetName: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Type</label>
              <select
                value={formData.assetType}
                onChange={e => setFormData({...formData, assetType: e.target.value as AssetType})}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Date Invested</label>
              <input
                required
                type="date"
                value={formData.investmentDate}
                onChange={e => setFormData({...formData, investmentDate: e.target.value})}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Initial Investment ($)</label>
              <input
                required
                type="number"
                min="0"
                value={formData.investedAmount}
                onChange={e => setFormData({...formData, investedAmount: Number(e.target.value)})}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Current Value ($)</label>
              <input
                required
                type="number"
                min="0"
                value={formData.currentValue}
                onChange={e => setFormData({...formData, currentValue: Number(e.target.value)})}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Owners (Comma separated)</label>
            <input
              type="text"
              placeholder="Alice, Bob"
              value={formData.owners}
              onChange={e => setFormData({...formData, owners: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Asset</Button>
          </div>
        </form>
      </div>
    </div>
  );
};