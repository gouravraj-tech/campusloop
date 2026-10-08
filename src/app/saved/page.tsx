"use client";

import { useEffect, useState } from "react";
import { ListingCard } from "@/components/ListingCard";
import { EmptyState } from "@/components/EmptyState";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";

export default function SavedPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const result = await apiClient<{ listings: any[] }>("/api/saved", {}, user.token);
      setListings(result.listings);
    })();
  }, [user]);

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
