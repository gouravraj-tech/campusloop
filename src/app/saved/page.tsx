"use client";

import useSWR from "swr";
import { ListingCard } from "@/components/ListingCard";
import { EmptyState } from "@/components/EmptyState";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import type { Listing } from "@/lib/store";

const fetchSavedListings = async ([path, token]: [string, string]) =>
  (await apiClient<{ listings: Array<Listing & { savedAt: string }> }>(path, {}, token)).listings;

export default function SavedPage() {
  const { user } = useAuth();
  const { data: listings = [] } = useSWR(
    user ? ["/api/saved", user.token] as [string, string] : null,
    fetchSavedListings,
  );

  return (
    <ProtectedRoute>
      <div className="space-y-6 py-6">
        <h1 className="text-3xl font-bold">Saved listings</h1>
        {listings.length === 0 ? (
          <EmptyState title="No saves yet" description="Bookmark things you like and come back here later." />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((item) => (
              <ListingCard
                key={item.id}
                id={item.id}
                title={item.title}
                description={item.description}
                price={item.price}
                category={item.category}
                pickupLocation={item.pickupLocation}
                imageUrl={item.imageUrl}
                status={item.status}
                sellerName={item.sellerName}
              />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
