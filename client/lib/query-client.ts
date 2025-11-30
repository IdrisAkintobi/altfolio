import { QueryClient, MutationCache, QueryCache } from '@tanstack/react-query';

class QueryManager {
  private static instance: QueryClient;

  static getInstance(): QueryClient {
    if (!QueryManager.instance) {
      QueryManager.instance = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
        queryCache: new QueryCache({
          onError: (error) => {
            console.error('Query error:', error);
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            console.error('Mutation error:', error);
          },
        }),
      });
    }
    return QueryManager.instance;
  }

  static invalidateByPath(path: string) {
    const client = QueryManager.getInstance();
    const resource = path.split('/')[0];
    
    client.invalidateQueries({ queryKey: [resource] });
  }

  static invalidateRelated(mutationType: 'create' | 'update' | 'delete', resource: string) {
    const client = QueryManager.getInstance();
    
    switch (resource) {
      case 'assets':
        client.invalidateQueries({ queryKey: ['assets'] });
        client.invalidateQueries({ queryKey: ['investments'] });
        break;
      case 'investments':
        client.invalidateQueries({ queryKey: ['investments'] });
        break;
      case 'users':
        client.invalidateQueries({ queryKey: ['users'] });
        break;
      default:
        client.invalidateQueries({ queryKey: [resource] });
    }
  }
}

export const queryClient = QueryManager.getInstance();
export { QueryManager };
