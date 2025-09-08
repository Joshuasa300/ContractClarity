import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery<User>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Disable constant refetching on focus
    refetchOnMount: false, // Only refetch if data is stale
    refetchInterval: false, // Disable automatic polling
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    refetch,
  };
}
