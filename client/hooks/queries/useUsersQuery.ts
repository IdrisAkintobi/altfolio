import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/query-keys';
import { apiClient } from '../../lib/api';
import { User } from '@shared/types';

export function useUsersQuery(page: number, limit: number, search: string) {
  return useQuery({
    queryKey: queryKeys.users.list(page, limit, search),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) {
        params.append('search', search);
      }
      return apiClient.get<{
        data: User[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>(`/users?${params.toString()}`);
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useUserQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<{ data: User }>(`/users/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}
