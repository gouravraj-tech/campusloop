"use client";

import Link from "next/link";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/ListingCard";
import { EmptyState } from "@/components/EmptyState";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import type { Listing } from "@/lib/store";

const fetchMyListings = async ([path, token]: [string, string]) =>
  (await apiClient<{ listings: Listing[] }>(path, {}, token)).listings;

export default function MyListingsPage() {
  const { user } = useAuth();
  const { data: listings = [] } = useSWR(
    user ? ["/api/me/listings", user.token] as [string, string] : null,
    fetchMyListings,
  );

  return (
    <ProtectedRoute>
      <div className="space-y-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Listings</h1>
            <p className="text-muted-foreground">Manage your student marketplace inventory.</p>
          </div>
          <Link href="/listings/new">
            <Button>Add new listing</Button>
          </Link>
        </div>

        {listings.length === 0 ? (
          <EmptyState title="No listings yet" description="Your items will appear here once you publish them." />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                description={listing.description}
                price={listing.price}
                category={listing.category}
                pickupLocation={listing.pickupLocation}
                imageUrl={listing.imageUrl}
                status={listing.status}
                sellerName={listing.sellerName}
              />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
