import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Asset, UserRole } from '@shared/types';
import { formatDate } from '../lib/utils';
import { Button } from './ui/Button';
import { DropdownMenu } from './ui/DropdownMenu';
import { Table, Column } from './ui/Table';
import { SearchInput } from './ui/SearchInput';
import {
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  TrendingDown,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { ASSET_TYPES } from '@shared/constants';

interface AssetListProps {
  assets: Asset[];
  userRole: UserRole;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onAdd: () => void;
  onInvest: (assetId: string) => void;
  onToggleListed: (id: string, currentStatus: boolean) => void;
  currentPage: number;
  totalPages: number;
  total: number;
  search: string;
  assetType: string;
  onSearch: (value: string) => void;
  onTypeFilter: (value: string) => void;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export const AssetList: React.FC<AssetListProps> = ({
  assets,
  userRole,
  onDelete,
  onEdit,
  onAdd,
  onInvest,
  onToggleListed,
  currentPage,
  totalPages,
  total,
  search,
  assetType,
  onSearch,
  onTypeFilter,
  onPageChange,
  onNextPage,
  onPrevPage,
}) => {
  const navigate = useNavigate();

  const columns: Column<Asset>[] = [
    {
      key: 'assetName',
      header: 'Asset Name',
      render: (asset) => (
        <span className="font-medium text-white">
          {asset.assetName}
          {!asset.isListed && <span className="ml-2 text-xs text-yellow-400">(Unlisted)</span>}
        </span>
      ),
    },
    {
      key: 'assetType',
      header: 'Type',
      render: (asset) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          {asset.assetType}
        </span>
      ),
    },
    {
      key: 'currentPerformance',
      header: 'Performance',
      align: 'right',
      render: (asset) => {
        const isPositive = asset.currentPerformance >= 0;
        return (
          <div
            className={`flex items-center justify-end gap-1 font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {isPositive ? '+' : ''}
            {asset.currentPerformance.toFixed(2)}%
          </div>
        );
      },
    },
    {
      key: 'lastUpdated',
      header: 'Last Updated',
      render: (asset) => <span className="text-slate-400">{formatDate(asset.lastUpdated)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (asset) => (
        <div className="flex items-center justify-end">
          {asset.isListed && userRole !== UserRole.ADMIN ? (
            <Button size="sm" onClick={() => onInvest(asset.id)} className="gap-1">
              Invest
            </Button>
          ) : userRole === UserRole.ADMIN ? (
            <DropdownMenu
              items={[
                {
                  label: 'View Investments',
                  icon: <Eye className="w-4 h-4" />,
                  onClick: () => navigate(`/investments?assetId=${asset.id}`),
                },
                {
                  label: 'Edit',
                  icon: <Edit2 className="w-4 h-4" />,
                  onClick: () => onEdit(asset.id),
                },
                {
                  label: asset.isListed ? 'Unlist' : 'List',
                  icon: asset.isListed ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  ),
                  onClick: () => onToggleListed(asset.id, asset.isListed),
                  className: asset.isListed ? 'text-yellow-400' : 'text-green-400',
                },
                {
                  label: 'Delete',
                  icon: <Trash2 className="w-4 h-4" />,
                  onClick: () => onDelete(asset.id),
                  className: 'text-red-400',
                },
              ]}
            />
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-slate-400">
          Showing {assets.length} of {total} assets
        </div>
        <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
          <SearchInput value={search} onChange={onSearch} placeholder="Search by asset name..." />
          <select
            value={assetType}
            onChange={(e) => onTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Types</option>
            {ASSET_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {userRole === UserRole.ADMIN && (
          <Button onClick={onAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Asset
          </Button>
        )}
      </div>

      <Table
        data={assets}
        columns={columns}
        emptyMessage="No assets found matching your criteria."
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onNextPage={onNextPage}
        onPrevPage={onPrevPage}
        getRowKey={(asset) => asset.id}
      />
    </div>
  );
};
