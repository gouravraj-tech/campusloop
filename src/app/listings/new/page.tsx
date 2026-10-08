"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ListingForm } from "@/components/ListingForm";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";

export default function NewListingPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-4xl py-6">
        <ListingForm
          submitLabel="Create listing"
          onSubmit={async (values) => {
            if (!user) {
              toast.error("Login required");
              return;
            }
            await apiClient("/api/listings", {
              method: "POST",
              body: JSON.stringify(values),
            }, user.token);
            toast.success("Listing published.");
            router.push("/");
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
