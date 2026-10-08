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
    <Card className="group overflow-hidden rounded-[1.4rem] border border-border/70 bg-card/90 shadow-[0_12px_32px_-24px_oklch(0.25_0.05_278_/_45%)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_42px_-25px_oklch(0.25_0.08_278_/_45%)]">
      <Link href={`/listings/${id}`} aria-label={`View ${title}`} className="relative block overflow-hidden bg-muted">
        <Image src={imageUrl} alt={title} width={600} height={400} unoptimized className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        <div className="absolute left-3 top-3">
          <Badge className="border-0 bg-card/90 font-bold text-foreground shadow-sm backdrop-blur">{category}</Badge>
        </div>
        <div className="absolute right-3 top-3">
          {status === "sold" ? <SoldBadge /> : <Badge className="border-0 bg-emerald-100 font-bold text-emerald-800 shadow-sm dark:bg-emerald-950 dark:text-emerald-200">Available</Badge>}
        </div>
      </Link>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold leading-snug tracking-tight">{title}</h3>
          </div>
          <p className="shrink-0 rounded-xl bg-secondary px-2.5 py-1 text-lg font-black text-secondary-foreground">₹{price}</p>
        </div>
        <p className="line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">{description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 shrink-0 text-primary" /> {pickupLocation}</span>
          <span className="inline-flex min-w-0 items-center gap-1.5 truncate"><MessageSquareText className="h-3.5 w-3.5 shrink-0 text-teal-600" /> {sellerName}</span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border/60 bg-muted/70 px-4 py-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><Tag className="h-3.5 w-3.5 text-primary" /> Campus pick</span>
        <Link href={`/listings/${id}`} className="text-sm font-bold text-primary transition hover:translate-x-0.5">View details →</Link>
      </CardFooter>
    </Card>
  );
}
