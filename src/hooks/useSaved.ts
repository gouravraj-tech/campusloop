"use client";

import useSWR from "swr";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";

export function useSaved() {
  const { user } = useAuth();

  const fetcher = async () => {
    const result = await apiClient<{ listings: Array<{ id: string; title: string; imageUrl: string; price: number }> }>(
      "/api/saved",
      {},
      user?.token ?? null,
    );
    return result.listings;
  };

  return useSWR(user ? ["saved", user.uid] : null, fetcher, { revalidateOnFocus: true });
}
