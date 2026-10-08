"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/FilterBar";
import { ListingCard } from "@/components/ListingCard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ListingSkeleton } from "@/components/ListingSkeleton";
import { useListings } from "@/hooks/useListings";
import { ArrowUpRight, BookOpen, Headphones, Laptop, Sparkles } from "lucide-react";

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
    <div className="space-y-9">
      <section className="relative isolate min-h-[350px] overflow-hidden rounded-[2rem] bg-[#28204d] px-6 py-9 text-white shadow-[0_25px_70px_-35px_oklch(0.32_0.16_300_/_65%)] sm:px-10 sm:py-12 lg:px-14">
        <div className="absolute -right-16 -top-28 -z-10 hidden size-80 rounded-full bg-fuchsia-500/80 blur-[1px] lg:block" />
        <div className="absolute -bottom-44 right-[22%] -z-10 hidden size-80 rounded-full bg-cyan-400/75 lg:block" />
        <div className="absolute right-[-5%] top-[35%] -z-10 hidden size-60 rounded-full bg-orange-400/90 lg:block" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.12),transparent_30%),linear-gradient(115deg,transparent_48%,rgba(255,255,255,0.08)_48.2%,transparent_48.8%)]" />
        <div className="grid min-h-[280px] items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-yellow-200 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Your campus, in the loop
            </div>
            <h1 className="mt-5 max-w-xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Good stuff finds <span className="text-yellow-300">new life</span> on campus.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-white/75 sm:text-base">
              Find student-loved essentials, pass on what you no longer need, and keep great finds close to home.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/listings/new">
                <Button size="lg" className="h-12 rounded-full bg-yellow-300 px-6 font-bold text-[#28204d] shadow-lg shadow-black/20 hover:bg-yellow-200">
                  Start selling <ArrowUpRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <a href="#marketplace" className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Explore finds
              </a>
            </div>
            <div className="mt-7 flex flex-wrap gap-2 text-xs font-semibold text-white/80">
              <span className="rounded-full bg-white/10 px-3 py-1.5">Textbooks</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">Tech</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">Campus essentials</span>
            </div>
          </div>
          <div className="relative hidden h-64 items-center justify-center lg:flex">
            <div className="absolute left-7 top-6 rotate-[-9deg] rounded-3xl bg-[#ffcf5a] p-5 text-[#28204d] shadow-2xl">
              <BookOpen className="size-12" strokeWidth={1.7} />
            </div>
            <div className="absolute right-8 top-2 rotate-[9deg] rounded-3xl bg-[#ff7f6d] p-5 text-[#28204d] shadow-2xl">
              <Headphones className="size-12" strokeWidth={1.7} />
            </div>
            <div className="absolute bottom-4 left-[30%] rotate-[4deg] rounded-3xl bg-[#88e4d3] p-5 text-[#28204d] shadow-2xl">
              <Laptop className="size-14" strokeWidth={1.6} />
            </div>
            <div className="absolute right-[6%] top-[45%] rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur">
              Find your next favorite
            </div>
            <div className="absolute left-[14%] bottom-[8%] size-4 rounded-full bg-yellow-200" />
            <div className="absolute right-[24%] top-[17%] size-3 rounded-full bg-cyan-200" />
          </div>
        </div>
      </section>

      <section id="marketplace" className="scroll-mt-24 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">The campus edit</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Find a good deal. Pass one on.</h2>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {filteredListings.length} {filteredListings.length === 1 ? "find" : "finds"} around campus
          </p>
        </div>
        <FilterBar
          search={search}
          category={category}
          condition={condition}
          onSearchChange={setSearch}
          onCategoryChange={(value) => setCategory(value || "All")}
          onConditionChange={(value) => setCondition(value || "All")}
        />
      </section>

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
