import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Users as UsersIcon, Eye } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { Table, Column } from '../components/ui/Table';
import { SearchInput } from '../components/ui/SearchInput';
import { DropdownMenu } from '../components/ui/DropdownMenu';
import { useDebounce } from '../hooks/useDebounce';
import { useUsersQuery } from '../hooks/queries/useUsersQuery';
import { User } from '@shared/types';

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;

  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, error } = useUsersQuery(page, limit, debouncedSearch);

  const users = data?.data || [];
  const total = data?.pagination.total || 0;
  const totalPages = data?.pagination.totalPages || 0;

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const goToPage = (pageNum: number) => setPage(pageNum);
  const nextPage = () => page < totalPages && setPage(page + 1);
  const prevPage = () => page > 1 && setPage(page - 1);

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (user) => <span className="font-medium text-white">{user.name}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (user) => <span className="text-slate-300">{user.email}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            user.role === 'admin'
              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
          }`}
        >
          {user.role}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (user) => (
        <span className="text-slate-400">
          {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (user) => (
        <div className="flex items-center justify-end">
          <DropdownMenu
            items={[
              {
                label: 'View Investments',
                icon: <Eye className="w-4 h-4" />,
                onClick: () => navigate(`/investments?userId=${user.id}`),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
        {error instanceof Error ? error.message : 'Failed to fetch users'}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Users</h1>
            <p className="text-slate-400 mt-1">Manage platform users and their roles.</p>
          </div>
          <div className="text-sm text-slate-400">Total: {total} users</div>
        </div>

        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Search by name or email..."
          className="max-w-md"
        />
      </div>

      <Table
        data={users}
        columns={columns}
        emptyMessage="No users found"
        emptyIcon={<UsersIcon className="w-12 h-12 text-slate-600" />}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={goToPage}
        onNextPage={nextPage}
        onPrevPage={prevPage}
        getRowKey={(user) => user.id}
      />
    </>
  );
};
