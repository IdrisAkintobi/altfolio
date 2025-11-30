import React, { useState } from 'react';
import { AssetType, UserRole } from '../../shared/types';
import { AssetList } from '../components/AssetList';
import { AssetModal } from '../components/AssetModal';
import { InvestmentModal } from '../components/InvestmentModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { useAssetsQuery } from '../hooks/queries/useAssetsQuery';
import { useCreateAsset, useUpdateAsset, useDeleteAsset } from '../hooks/mutations/useAssetMutations';
import { useCreateInvestment } from '../hooks/mutations/useInvestmentMutations';
import { Loader2 } from 'lucide-react';

export const AssetsPage: React.FC = () => {
  const { user } = useAuth();
  const confirmDialog = useConfirmDialog();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [assetType, setAssetType] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  
  const debouncedSearch = useDebounce(search, 300);
  const limit = 10;
  
  const { data, isLoading } = useAssetsQuery(page, limit, debouncedSearch, assetType);
  const createAssetMutation = useCreateAsset();
  const updateAssetMutation = useUpdateAsset();
  const deleteAssetMutation = useDeleteAsset();
  const createInvestmentMutation = useCreateInvestment();
  
  const assets = data?.data || [];
  const total = data?.pagination.total || 0;
  const totalPages = data?.pagination.totalPages || 0;

  const handleSave = async (data: {
    assetName: string;
    assetType: AssetType;
    currentPerformance: number;
  }) => {
    if (editingId) {
      await updateAssetMutation.mutateAsync({ id: editingId, data });
    } else {
      await createAssetMutation.mutateAsync(data);
    }
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const asset = assets.find(a => a.id === id);
    confirmDialog.confirm({
      title: 'Delete Asset',
      message: `Are you sure you want to delete "${asset?.assetName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        await deleteAssetMutation.mutateAsync(id);
      },
    });
  };

  const handleToggleListed = (id: string, currentStatus: boolean) => {
    const asset = assets.find(a => a.id === id);
    const action = currentStatus ? 'unlist' : 'list';
    confirmDialog.confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Asset`,
      message: `Are you sure you want to ${action} "${asset?.assetName}"?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      variant: currentStatus ? 'warning' : 'info',
      onConfirm: async () => {
        await updateAssetMutation.mutateAsync({ id, data: { isListed: !currentStatus } });
      },
    });
  };
  
  const goToPage = (pageNum: number) => setPage(pageNum);
  const nextPage = () => page < totalPages && setPage(page + 1);
  const prevPage = () => page > 1 && setPage(page - 1);
  const handleSearch = (value: string) => { setSearch(value); setPage(1); };
  const handleTypeFilter = (value: string) => { setAssetType(value); setPage(1); };

  const openEditModal = (id: string) => {
    setEditingId(id);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleInvest = (assetId: string) => {
    setSelectedAssetId(assetId);
    setIsInvestmentModalOpen(true);
  };

  const handleInvestmentSave = async (data: {
    assetId: string;
    investedAmount: number;
    investmentDate: string;
  }) => {
    await createInvestmentMutation.mutateAsync(data);
    setIsInvestmentModalOpen(false);
    setSelectedAssetId(null);
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Assets
        </h1>
        <p className="text-slate-400 mt-1">
          Manage available assets for investment.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <AssetList
          assets={assets}
          userRole={user?.role || UserRole.VIEWER}
          onDelete={handleDelete}
          onEdit={openEditModal}
          onAdd={openAddModal}
          onInvest={handleInvest}
          onToggleListed={handleToggleListed}
          currentPage={page}
          totalPages={totalPages}
          total={total}
          search={search}
          assetType={assetType}
          onSearch={handleSearch}
          onTypeFilter={handleTypeFilter}
          onPageChange={goToPage}
          onNextPage={() => nextPage()}
          onPrevPage={() => prevPage()}
        />
      )}

      <AssetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onSave={handleSave}
        initialData={
          editingId ? assets.find((a) => a.id === editingId) : undefined
        }
      />

      <InvestmentModal
        isOpen={isInvestmentModalOpen}
        onClose={() => {
          setIsInvestmentModalOpen(false);
          setSelectedAssetId(null);
        }}
        onSave={handleInvestmentSave}
        assets={assets}
        preSelectedAssetId={selectedAssetId}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.handleClose}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        variant={confirmDialog.variant}
        isLoading={confirmDialog.isLoading}
      />
    </>
  );
};
