import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 0, // Always consider data stale to enable immediate refetch
      cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    },
  },
});

// Default fetch function for API requests
export const apiRequest = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || `API request failed: ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
};

// Set default query function
queryClient.setDefaultOptions({
  queries: {
    queryFn: ({ queryKey }) => apiRequest(queryKey[0] as string),
  },
});