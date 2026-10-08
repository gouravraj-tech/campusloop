"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);

  const loadListing = async () => {
    try {
      const result = await apiClient<{ listing: any }>(`/api/listings/${params.id}`);
      setListing(result.listing);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load listing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) {
      void loadListing();
    }
  }, [params?.id]);

  useEffect(() => {
    if (!user || !listing) return;

    void (async () => {
      const result = await apiClient<{ listings: Array<{ id: string }> }> ("/api/saved", {}, user.token);
      setSaved(result.listings.some((item) => item.id === listing.id));
    })();
  }, [listing?.id, user]);

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
    await loadListing();
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
        setSaved(false);
        toast.success("Removed from saved listings");
      } else {
        await apiClient(`/api/saved/${listing.id}`, { method: "POST" }, user.token);
        setSaved(true);
        toast.success("Saved listing");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update saved listing");
    }
  };

  return (
    <div className="space-y-6 py-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <img src={listing.imageUrl} alt={listing.title} className="h-[420px] w-full object-cover" />
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
