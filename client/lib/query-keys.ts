export const queryKeys = {
  assets: {
    all: ['assets'] as const,
    lists: () => [...queryKeys.assets.all, 'list'] as const,
    list: (page: number, limit: number, search?: string, type?: string) =>
      [...queryKeys.assets.lists(), { page, limit, search, type }] as const,
    details: () => [...queryKeys.assets.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.assets.details(), id] as const,
  },
  investments: {
    all: ['investments'] as const,
    lists: () => [...queryKeys.investments.all, 'list'] as const,
    list: (page: number, limit: number, assetId?: string, userId?: string) =>
      [...queryKeys.investments.lists(), { page, limit, assetId, userId }] as const,
    details: () => [...queryKeys.investments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.investments.details(), id] as const,
  },
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (page: number, limit: number, search?: string) =>
      [...queryKeys.users.lists(), { page, limit, search }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
} as const;
