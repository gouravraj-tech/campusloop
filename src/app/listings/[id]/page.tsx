"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Listing } from "@/lib/store";

const fetchListing = async (path: string) => (await apiClient<{ listing: Listing }>(path)).listing;

export default function ListingDetailPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center">Loading listing...</div>}>
      <ListingDetailPageContent />
    </Suspense>
  );
}

function ListingDetailPageContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: listing, error: listingError, isLoading: loading, mutate: reloadListing } = useSWR(
    params.id ? `/api/listings/${params.id}` : null,
    fetchListing,
  );
  const [message, setMessage] = useState("");

  const { data: savedListings, mutate: mutateSaved } = useSWR(
    user && listing ? ["saved-listings", user.uid, user.token] as [string, string, string] : null,
    async ([, , token]) => (await apiClient<{ listings: Array<{ id: string }> }>("/api/saved", {}, token)).listings,
  );
  const saved = savedListings?.some((item) => item.id === listing?.id) ?? false;

  useEffect(() => {
    if (listingError) {
      toast.error(listingError instanceof Error ? listingError.message : "Unable to load listing");
    }
  }, [listingError]);

  if (loading) return <div className="py-10 text-center">Loading listing...</div>;
  if (!listing) return <div className="py-10 text-center">Listing not found.</div>;

  const isOwner = user?.uid === listing.sellerId;

  const handleMessage = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!message.trim()) {
      toast.error("Write a message before sending.");
      return;
    }

    await apiClient(`/api/listings/${listing.id}/inquiries`, {
      method: "POST",
      body: JSON.stringify({ text: message }),
    }, user.token);
    toast.success("Message sent to the seller");
    setMessage("");
  };

  const handleSold = async () => {
    if (!user) return;
    await apiClient(`/api/listings/${listing.id}/sold`, { method: "POST" }, user.token);
    toast.success("Listing marked as sold.");
    await reloadListing();
  };

  const handleDelete = async () => {
    if (!user) return;
    await apiClient(`/api/listings/${listing.id}`, { method: "DELETE" }, user.token);
    toast.success("Listing deleted.");
    router.push("/");
  };

  const handleSaveToggle = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      if (saved) {
        await apiClient(`/api/saved/${listing.id}`, { method: "DELETE" }, user.token);
        toast.success("Removed from saved listings");
      } else {
        await apiClient(`/api/saved/${listing.id}`, { method: "POST" }, user.token);
        toast.success("Saved listing");
      }
      await mutateSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update saved listing");
    }
  };

  return (
    <div className="space-y-6 py-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <Image src={listing.imageUrl} alt={listing.title} width={1200} height={840} unoptimized className="h-[420px] w-full object-cover" />
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase text-muted-foreground">{listing.category}</p>
                <h1 className="mt-2 text-3xl font-bold">{listing.title}</h1>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">₹{listing.price}</p>
                <p className="text-sm text-muted-foreground">{listing.status}</p>
              </div>
            </div>
            <p className="text-muted-foreground">{listing.description}</p>
            <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
              <span>Condition: {listing.condition}</span>
              <span>Location: {listing.pickupLocation}</span>
              <span>College: {listing.college}</span>
            </div>

            {isOwner ? (
              <div className="flex gap-3">
                <Link href={`/listings/${listing.id}/edit`}>
                  <Button variant="outline">Edit listing</Button>
                </Link>
                <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                {listing.status !== "sold" && <Button onClick={handleSold}>Mark sold</Button>}
              </div>
            ) : (
              <div className="flex gap-3">
                <Button variant={saved ? "secondary" : "outline"} onClick={handleSaveToggle}>
                  {saved ? "Saved" : "Save listing"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seller</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold">{listing.sellerName}</p>
              <p className="text-sm text-muted-foreground">{listing.college}</p>
            </div>
            <div className="rounded-xl border bg-muted p-3 text-sm">
              <p className="font-medium">Pickup spot</p>
              <p className="mt-1 text-muted-foreground">{listing.pickupLocation}</p>
            </div>
            <div className="space-y-3">
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Send a quick inquiry..." />
              <Button className="w-full" onClick={handleMessage}>Send inquiry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
