"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { getFirebaseClient } from "@/lib/firebase-client";
import { signInWithEmailAndPassword } from "firebase/auth";
import type { CampusUser } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const firebase = getFirebaseClient();
      if (firebase) {
        const credential = await signInWithEmailAndPassword(firebase.auth, email.trim(), password);
        const token = await credential.user.getIdToken();
        const result = await apiClient<{ user: Omit<CampusUser, "token"> }>(
          "/api/users",
          {
            method: "POST",
            body: JSON.stringify({ email: credential.user.email, name: credential.user.displayName }),
          },
          token,
        );
        login({ ...result.user, token });
      } else {
        const result = await apiClient<{ user: CampusUser }>(
          "/api/users",
          { method: "POST", body: JSON.stringify({ email: email.trim(), name: "Aarav Sharma", college: "School of Engineering" }) },
        );
        login(result.user);
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Login to CampusLoop</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Campus email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              No account yet? <Link href="/register" className="text-primary">Register</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
