"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, CONDITIONS, PICKUP_LOCATIONS } from "@/lib/constants";
import { listingSchema } from "@/lib/schemas";

export type ListingFormValues = z.infer<typeof listingSchema>;

export function ListingForm({
  defaultValues,
  onSubmit,
  submitLabel,
}: {
  defaultValues?: Partial<ListingFormValues>;
  onSubmit: (values: ListingFormValues) => Promise<void> | void;
  submitLabel: string;
}) {
  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      price: Number(defaultValues?.price ?? 0),
      category: (defaultValues?.category as ListingFormValues["category"]) ?? "Books",
      condition: (defaultValues?.condition as ListingFormValues["condition"]) ?? "Good",
      pickupLocation: defaultValues?.pickupLocation ?? PICKUP_LOCATIONS[0],
      imageUrl: defaultValues?.imageUrl ?? "",
      status: defaultValues?.status ?? "available",
      isbn: defaultValues?.isbn ?? "",
    },
  });
  const category = useWatch({ control: form.control, name: "category" });
  const condition = useWatch({ control: form.control, name: "condition" });
  const pickupLocation = useWatch({ control: form.control, name: "pickupLocation" });
  const imageUrl = useWatch({ control: form.control, name: "imageUrl" });

  const handleCategoryChange = (value: string | null) => {
    if (value) {
      form.setValue("category", value as ListingFormValues["category"], { shouldValidate: true });
    }
  };

  const handleConditionChange = (value: string | null) => {
    if (value) {
      form.setValue("condition", value as ListingFormValues["condition"], { shouldValidate: true });
    }
  };

  const handlePickupLocationChange = (value: string | null) => {
    if (value) {
      form.setValue("pickupLocation", value, { shouldValidate: true });
    }
  };

  const handleSubmit = async (values: ListingFormValues) => {
    await onSubmit(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{submitLabel}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...form.register("title")} />
              {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register("description")} />
              {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input id="price" type="number" {...form.register("price", { valueAsNumber: true })} />
              {form.formState.errors.price && <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Condition</Label>
              <Select value={condition} onValueChange={handleConditionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pickup location</Label>
              <Select value={pickupLocation} onValueChange={handlePickupLocationChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pickup location" />
                </SelectTrigger>
                <SelectContent>
                  {PICKUP_LOCATIONS.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="listingImage">Listing photo</Label>
              <Input
                id="listingImage"
                type="url"
                placeholder="https://example.com/photo.jpg"
                {...form.register("imageUrl")}
              />
              {form.formState.errors.imageUrl && (
                <p className="text-sm text-destructive">{form.formState.errors.imageUrl.message}</p>
              )}
              {imageUrl && (
                <div className="relative overflow-hidden rounded-2xl border border-border bg-muted">
                  <Image
                    src={imageUrl}
                    alt="Listing photo preview"
                    width={1200}
                    height={800}
                    unoptimized
                    className="h-56 w-full object-contain sm:h-72"
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">Paste a direct link to a photo of the actual item.</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="isbn">ISBN (optional)</Label>
              <Input id="isbn" {...form.register("isbn")} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
