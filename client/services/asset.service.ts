import { Asset, AssetPerformanceHistory, AssetType } from '@shared/types';
import { apiClient } from '../lib/api';

interface PaginatedResponse<T> {
  status: string;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface CreateAssetRequest {
  assetName: string;
  assetType: AssetType;
  currentPerformance: number;
}

export const assetService = {
  async getAll(
    page = 1,
    limit = 100,
    search?: string,
    assetType?: string
  ): Promise<PaginatedResponse<Asset>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      params.append('search', search);
    }
    if (assetType && assetType !== 'All') {
      params.append('assetType', assetType);
    }
    return apiClient.get<PaginatedResponse<Asset>>(`/assets?${params.toString()}`);
  },

  async getByType(type: AssetType): Promise<ApiResponse<Asset[]>> {
    return apiClient.get<ApiResponse<Asset[]>>(`/assets/type/${type}`);
  },

  async getById(id: string): Promise<ApiResponse<Asset>> {
    return apiClient.get<ApiResponse<Asset>>(`/assets/${id}`);
  },

  async getPerformanceHistory(
    id: string,
    params?: { startDate?: string; endDate?: string; limit?: number }
  ): Promise<ApiResponse<AssetPerformanceHistory[]>> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiClient.get<ApiResponse<AssetPerformanceHistory[]>>(
      `/assets/${id}/performance-history${query ? `?${query}` : ''}`
    );
  },

  async create(data: CreateAssetRequest): Promise<ApiResponse<Asset>> {
    return apiClient.post<ApiResponse<Asset>>('/assets', data);
  },

  async update(id: string, data: Partial<CreateAssetRequest>): Promise<ApiResponse<Asset>> {
    return apiClient.put<ApiResponse<Asset>>(`/assets/${id}`, data);
  },

  async updatePerformance(id: string, currentPerformance: number): Promise<ApiResponse<Asset>> {
    return apiClient.patch<ApiResponse<Asset>>(`/assets/${id}/performance`, {
      currentPerformance,
    });
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/assets/${id}`);
  },
};
