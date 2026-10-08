"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ListingForm, type ListingFormValues } from "@/components/ListingForm";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import type { Listing } from "@/lib/store";

export default function EditListingPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center">Loading listing editor...</div>}>
      <EditListingPageContent />
    </Suspense>
  );
}

function EditListingPageContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [initialValues, setInitialValues] = useState<Partial<ListingFormValues> | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    void (async () => {
      const result = await apiClient<{ listing: Listing }>(`/api/listings/${params.id}`);
      setInitialValues({
        ...result.listing,
        isbn: result.listing.book?.isbn,
      });
    })();
  }, [params?.id]);

  if (!user || !initialValues) return null;

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-4xl py-6">
        <ListingForm
          submitLabel="Update listing"
          defaultValues={initialValues}
          onSubmit={async (values) => {
            await apiClient(`/api/listings/${params.id}`, { method: "PATCH", body: JSON.stringify(values) }, user.token);
            router.push(`/listings/${params.id}`);
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
