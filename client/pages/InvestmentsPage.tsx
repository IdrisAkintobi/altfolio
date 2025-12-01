import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserRole, InvestmentWithAsset } from '@shared/types';
import { InvestmentList } from '../components/InvestmentList';
import { InvestmentDetailsModal } from '../components/InvestmentDetailsModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { useInvestmentsQuery } from '../hooks/queries/useInvestmentsQuery';
import { useUserQuery } from '../hooks/queries/useUsersQuery';
import { useAssetQuery } from '../hooks/queries/useAssetsQuery';
import { useDeleteInvestment } from '../hooks/mutations/useInvestmentMutations';
import { Loader2, X } from 'lucide-react';

export const InvestmentsPage: React.FC = () => {
  const { user } = useAuth();
  const confirmDialog = useConfirmDialog();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentWithAsset | null>(null);

  const assetId = searchParams.get('assetId') || undefined;
  const userId = searchParams.get('userId') || undefined;

  const filters = {
    ...(assetId && { assetId }),
    ...(userId && { userId }),
  };

  const { data, isLoading } = useInvestmentsQuery(
    page,
    limit,
    Object.keys(filters).length > 0 ? filters : undefined
  );

  // Fetch user and asset data for filter display
  const { data: filterUser } = useUserQuery(userId || '');
  const { data: filterAssetData } = useAssetQuery(assetId || '');
  const filterAsset = filterAssetData?.data;

  const deleteInvestmentMutation = useDeleteInvestment();

  const investments = data?.data || [];
  const total = data?.pagination.total || 0;
  const totalPages = data?.pagination.totalPages || 0;

  const handleDelete = (id: string) => {
    const investment = investments.find((inv) => inv.id === id);
    confirmDialog.confirm({
      title: 'Delete Investment',
      message: `Are you sure you want to delete this investment in "${investment?.asset?.assetName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        await deleteInvestmentMutation.mutateAsync(id);
      },
    });
  };

  const handleView = (investment: InvestmentWithAsset) => {
    setSelectedInvestment(investment);
  };

  const clearFilters = () => {
    setSearchParams({});
    setPage(1);
  };

  const goToPage = (pageNum: number) => setPage(pageNum);
  const nextPage = () => page < totalPages && setPage(page + 1);
  const prevPage = () => page > 1 && setPage(page - 1);

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Investments</h1>
            <p className="text-slate-400 mt-1">Manage your investment entries.</p>
          </div>
          {(assetId || userId) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
        {(assetId || userId) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {assetId && filterAsset && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm">
                <span className="text-slate-400">Asset:</span>
                <span className="text-white font-medium">{filterAsset.assetName}</span>
              </div>
            )}
            {userId && filterUser && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
                <span className="text-slate-400">User:</span>
                <span className="text-white font-medium">
                  {filterUser.name || filterUser.email}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <InvestmentList
          investments={investments}
          userRole={user?.role || UserRole.VIEWER}
          onDelete={handleDelete}
          onView={handleView}
          currentPage={page}
          totalPages={totalPages}
          total={total}
          onPageChange={goToPage}
          onNextPage={() => nextPage()}
          onPrevPage={() => prevPage()}
        />
      )}

      <InvestmentDetailsModal
        isOpen={!!selectedInvestment}
        onClose={() => setSelectedInvestment(null)}
        investment={selectedInvestment}
        isAdmin={user?.role === UserRole.ADMIN}
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
