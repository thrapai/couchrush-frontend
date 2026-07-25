import { useAuth } from '@couchrush/auth';
import { useQuery } from '@tanstack/react-query';

export const TOTAL_USERS_QUERY_KEY = ['admin', 'dashboard', 'total-users'] as const;
export const ACTIVE_USERS_QUERY_KEY = ['admin', 'dashboard', 'active-users'] as const;

export function useTotalUsersMetric(enabled: boolean) {
  const { client } = useAuth();

  return useQuery({
    queryKey: TOTAL_USERS_QUERY_KEY,
    queryFn: async () => client.listAdminUsers({ page: 1, page_size: 1 }),
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useActiveUsersMetric(enabled: boolean) {
  const { client } = useAuth();

  return useQuery({
    queryKey: ACTIVE_USERS_QUERY_KEY,
    queryFn: async () => client.listAdminUsers({ page: 1, page_size: 1, is_active: true }),
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
