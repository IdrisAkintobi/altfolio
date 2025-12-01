import { InvestmentWithAsset } from '@shared/types';
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

interface CreateInvestmentRequest {
  assetId: string;
  investedAmount: number;
  investmentDate: string;
}

export const investmentService = {
  async getAll(
    page = 1,
    limit = 100,
    filters?: { assetId?: string; userId?: string }
  ): Promise<PaginatedResponse<InvestmentWithAsset>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (filters?.assetId) {
      params.append('assetId', filters.assetId);
    }
    if (filters?.userId) {
      params.append('userId', filters.userId);
    }
    return apiClient.get<PaginatedResponse<InvestmentWithAsset>>(
      `/investments?${params.toString()}`
    );
  },

  async getById(id: string): Promise<ApiResponse<InvestmentWithAsset>> {
    return apiClient.get<ApiResponse<InvestmentWithAsset>>(`/investments/${id}`);
  },

  async create(data: CreateInvestmentRequest): Promise<ApiResponse<InvestmentWithAsset>> {
    return apiClient.post<ApiResponse<InvestmentWithAsset>>('/investments', data);
  },

  async update(
    id: string,
    data: CreateInvestmentRequest
  ): Promise<ApiResponse<InvestmentWithAsset>> {
    return apiClient.put<ApiResponse<InvestmentWithAsset>>(`/investments/${id}`, data);
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/investments/${id}`);
  },
};
