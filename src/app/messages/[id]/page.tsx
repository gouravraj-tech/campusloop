"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ThreadView } from "@/components/ThreadView";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";

export default function MessageThreadPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center">Loading conversation...</div>}>
      <MessageThreadPageContent />
    </Suspense>
  );
}

function MessageThreadPageContent() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [thread, setThread] = useState<any>(null);
  const [text, setText] = useState("");

  const loadThread = async () => {
    if (!user) return;
    const result = await apiClient<{ conversation: any }>(`/api/conversations/${params.id}`, {}, user.token);
    setThread(result.conversation);
  };

  useEffect(() => {
    if (params?.id && user) {
      void loadThread();
    }
  }, [params?.id, user]);

  if (!user) return null;

  const handleSend = async () => {
    if (!text.trim()) return;
    await apiClient(`/api/conversations/${params.id}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }, user.token);
    setText("");
    await loadThread();
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6 py-6">
        <Card>
          <CardHeader>
            <CardTitle>{thread?.listingTitle ?? "Thread"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {thread ? (
              <>
                <ThreadView messages={thread.messages ?? []} currentUserId={user.uid} />
                <div className="space-y-2">
                  <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply to seller" />
                  <Button onClick={handleSend}>Send message</Button>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Loading conversation...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
