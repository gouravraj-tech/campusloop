"use client";

import { useState, type ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
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
  const { user } = useAuth();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [photoStatus, setPhotoStatus] = useState("");
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

  const handlePhotoSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"].includes(file.type)) {
      setPhotoError("Choose a JPEG, PNG, WebP, GIF, or HEIC image.");
      setPhotoStatus("");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setPhotoError("Choose an image smaller than 8 MB.");
      setPhotoStatus("");
      return;
    }
    if (!user) {
      setPhotoError("Sign in before uploading a photo.");
      setPhotoStatus("");
      return;
    }

    setUploadingPhoto(true);
    setPhotoError("");
    setPhotoStatus("");
    try {
      const signature = await apiClient<{
        cloudName: string;
        apiKey: string;
        signature: string;
        folder: string;
        overwrite: string;
        public_id: string;
        timestamp: string;
      }>("/api/uploads/signature", { method: "POST" }, user.token);

      const body = new FormData();
      body.append("file", file);
      body.append("api_key", signature.apiKey);
      body.append("folder", signature.folder);
      body.append("overwrite", signature.overwrite);
      body.append("public_id", signature.public_id);
      body.append("timestamp", signature.timestamp);
      body.append("signature", signature.signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/image/upload`,
        { method: "POST", body },
      );
      const result: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof result === "object" && result !== null && "error" in result &&
          typeof result.error === "object" && result.error !== null &&
          "message" in result.error && typeof result.error.message === "string"
            ? result.error.message
            : "Photo upload failed. Please try again.";
        throw new Error(message);
      }
      if (typeof result !== "object" || result === null || !("secure_url" in result) || typeof result.secure_url !== "string") {
        throw new Error("The photo service did not return an image link.");
      }

      form.setValue("imageUrl", result.secure_url, { shouldDirty: true, shouldValidate: true });
      setPhotoStatus("Photo uploaded and ready to save.");
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : "Photo upload failed. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
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
              <Label htmlFor="listingPhotoFile">Choose a photo from your device</Label>
              <Input
                id="listingPhotoFile"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
                disabled={uploadingPhoto}
                onChange={handlePhotoSelected}
              />
              <p className="text-xs text-muted-foreground">Choose a photo from your gallery or device (maximum 8 MB).</p>
              {uploadingPhoto && <p role="status" className="text-sm text-muted-foreground">Uploading photo...</p>}
              {photoStatus && <p role="status" className="text-sm text-green-700">{photoStatus}</p>}
              {photoError && <p role="alert" className="text-sm text-destructive">{photoError}</p>}
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
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="isbn">ISBN (optional)</Label>
              <Input id="isbn" {...form.register("isbn")} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || uploadingPhoto}>
            {uploadingPhoto ? "Uploading photo..." : form.formState.isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
