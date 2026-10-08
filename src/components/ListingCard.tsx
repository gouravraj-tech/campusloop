import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageSquareText, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { SoldBadge } from "@/components/SoldBadge";

export type ListingCardProps = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  pickupLocation: string;
  imageUrl: string;
  status?: "available" | "sold";
  sellerName: string;
};

export function ListingCard({ id, title, description, price, category, pickupLocation, imageUrl, status = "available", sellerName }: ListingCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <Image src={imageUrl} alt={title} width={600} height={400} unoptimized className="h-52 w-full object-cover" />
        <div className="absolute right-3 top-3">
          {status === "sold" ? <SoldBadge /> : <Badge variant="secondary">Available</Badge>}
        </div>
      </div>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{category}</p>
            <h3 className="mt-1 text-lg font-semibold">{title}</h3>
          </div>
          <p className="text-lg font-bold text-primary">₹{price}</p>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {pickupLocation}</span>
          <span className="inline-flex items-center gap-1"><MessageSquareText className="h-3.5 w-3.5" /> {sellerName}</span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t px-4 py-3">
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Tag className="h-3.5 w-3.5" /> Campus verified</span>
        <Link href={`/listings/${id}`} className="text-sm font-medium text-primary">View details</Link>
      </CardFooter>
    </Card>
  );
}
