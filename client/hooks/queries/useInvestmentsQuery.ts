import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/query-keys';
import { investmentService } from '../../services/investment.service';

export function useInvestmentsQuery(
  page: number,
  limit: number,
  filters?: { assetId?: string; userId?: string }
) {
  return useQuery({
    queryKey: queryKeys.investments.list(page, limit, filters?.assetId, filters?.userId),
    queryFn: () => investmentService.getAll(page, limit, filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useInvestmentQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.investments.detail(id),
    queryFn: () => investmentService.getById(id),
    enabled: !!id,
  });
}
