"use client";

import Link from "next/link";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import type { Conversation } from "@/lib/store";

const fetchConversations = async ([path, token]: [string, string]) =>
  (await apiClient<{ conversations: Conversation[] }>(path, {}, token)).conversations;

export default function MessagesPage() {
  const { user } = useAuth();
  const { data: threads = [] } = useSWR(
    user ? ["/api/conversations", user.token] as [string, string] : null,
    fetchConversations,
  );

  return (
    <ProtectedRoute>
      <div className="space-y-6 py-6">
        <h1 className="text-3xl font-bold">Inbox</h1>
        {threads.length === 0 ? (
          <EmptyState title="No messages yet" description="When someone inquires about your item, it will show up here." />
        ) : (
          <div className="space-y-3">
            {threads.map((thread) => (
              <Link key={thread.id} href={`/messages/${thread.id}`}>
                <Card className="transition hover:shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>{thread.listingTitle}</span>
                      <span className="text-xs text-muted-foreground">{new Date(thread.lastMessageAt).toLocaleString()}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{thread.lastMessage}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
