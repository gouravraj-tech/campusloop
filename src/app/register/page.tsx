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
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import type { CampusUser } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", college: "" });
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
        const credential = await createUserWithEmailAndPassword(firebase.auth, form.email.trim(), password);
        await updateProfile(credential.user, { displayName: form.name.trim() });
        const token = await credential.user.getIdToken(true);
        const result = await apiClient<{ user: Omit<CampusUser, "token"> }>(
          "/api/users",
          { method: "POST", body: JSON.stringify(form) },
          token,
        );
        login({ ...result.user, token });
      } else {
        const result = await apiClient<{ user: CampusUser }>(
          "/api/users",
          { method: "POST", body: JSON.stringify(form) },
        );
        login(result.user);
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign up.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college">College</Label>
              <Input id="college" required value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating account..." : "Register"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account? <Link href="/login" className="text-primary">Login</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
