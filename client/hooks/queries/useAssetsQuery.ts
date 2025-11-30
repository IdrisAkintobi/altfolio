import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/query-keys';
import { assetService } from '../../services/asset.service';

export function useAssetsQuery(
  page: number,
  limit: number,
  search: string,
  assetType: string
) {
  return useQuery({
    queryKey: queryKeys.assets.list(page, limit, search, assetType),
    queryFn: () => assetService.getAll(page, limit, search, assetType),
    placeholderData: (previousData) => previousData,
  });
}

export function useAssetQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.assets.detail(id),
    queryFn: () => assetService.getById(id),
    enabled: !!id,
  });
}
