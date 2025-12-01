import { useMutation } from '@tanstack/react-query';
import { AssetType } from '@shared/types';
import { assetService } from '../../services/asset.service';
import { QueryManager } from '../../lib/query-client';

export function useCreateAsset() {
  return useMutation({
    mutationFn: (data: { assetName: string; assetType: AssetType; currentPerformance: number }) =>
      assetService.create(data),
    onSuccess: () => {
      QueryManager.invalidateRelated('create', 'assets');
    },
  });
}

export function useUpdateAsset() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        assetName: string;
        assetType: AssetType;
        currentPerformance: number;
        isListed: boolean;
      }>;
    }) => assetService.update(id, data),
    onSuccess: () => {
      QueryManager.invalidateRelated('update', 'assets');
    },
  });
}

export function useDeleteAsset() {
  return useMutation({
    mutationFn: (id: string) => assetService.delete(id),
    onSuccess: () => {
      QueryManager.invalidateRelated('delete', 'assets');
    },
  });
}
