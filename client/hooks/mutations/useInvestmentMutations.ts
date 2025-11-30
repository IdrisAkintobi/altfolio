import { useMutation } from '@tanstack/react-query';
import { investmentService } from '../../services/investment.service';
import { QueryManager } from '../../lib/query-client';

export function useCreateInvestment() {
  return useMutation({
    mutationFn: (data: {
      assetId: string;
      investedAmount: number;
      investmentDate: string;
    }) => investmentService.create(data),
    onSuccess: () => {
      QueryManager.invalidateRelated('create', 'investments');
    },
  });
}

export function useDeleteInvestment() {
  return useMutation({
    mutationFn: (id: string) => investmentService.delete(id),
    onSuccess: () => {
      QueryManager.invalidateRelated('delete', 'investments');
    },
  });
}
