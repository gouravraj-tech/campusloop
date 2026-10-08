"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FilterBar } from "@/components/FilterBar";
import { ListingCard, type ListingCardProps } from "@/components/ListingCard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ListingSkeleton } from "@/components/ListingSkeleton";
import { useListings } from "@/hooks/useListings";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [condition, setCondition] = useState("All");
  const { data, error, isLoading } = useListings(search);

  const filteredListings = useMemo(() => {
    if (!data) return [];
    return data.filter((listing) => {
      const matchesCategory = category === "All" || listing.category === category;
      const matchesCondition = condition === "All" || listing.condition === condition;
      const text = `${listing.title} ${listing.description} ${listing.searchText ?? ""}`.toLowerCase();
      const matchesSearch = !search || text.includes(search.toLowerCase());
      return matchesCategory && matchesCondition && matchesSearch;
    });
  }, [category, condition, data, search]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-sky-600 to-cyan-500 p-8 text-primary-foreground shadow-lg">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-100">Campus Marketplace</p>
            <h1 className="mt-3 text-4xl font-bold">Buy, sell and save around campus.</h1>
            <p className="mt-2 max-w-xl text-sm text-sky-100">Discover textbooks, gadgets and essentials from students you trust.</p>
          </div>
          <Link href="/listings/new">
            <Button variant="secondary" size="lg">Create a listing</Button>
          </Link>
        </div>
      </section>

      <FilterBar
        search={search}
        category={category}
        condition={condition}
        onSearchChange={setSearch}
        onCategoryChange={(value) => setCategory(value || "All")}
        onConditionChange={(value) => setCondition(value || "All")}
      />

      {error ? (
        <ErrorState message={error.message} />
      ) : isLoading ? (
        <ListingSkeleton />
      ) : filteredListings.length === 0 ? (
        <EmptyState title="No listings found" description="Try a different search or list a new item for your campus." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredListings.map((listing) => (
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
  );
}
