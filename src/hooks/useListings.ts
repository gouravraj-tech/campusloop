"use client";

import useSWR from "swr";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";

export type ListingRecord = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  pickupLocation: string;
  imageUrl: string;
  status: "available" | "sold";
  sellerId: string;
  sellerName: string;
  college: string;
  createdAt: string;
  updatedAt: string;
  searchText?: string;
  book?: {
    isbn?: string;
    title?: string;
    authors?: string[];
    publisher?: string;
    coverUrl?: string;
  };
};

export function useListings(query = "") {
  const { user } = useAuth();

  const fetcher = async () => {
    const params = query ? `?q=${encodeURIComponent(query)}` : "";
    const result = await apiClient<{ listings: ListingRecord[] }>(`/api/listings${params}`, {}, user?.token ?? null);
    return result.listings;
  };

  return useSWR<ListingRecord[]>(["listings", query, user?.token ?? "guest"], fetcher, {
    revalidateOnFocus: true,
  });
}
