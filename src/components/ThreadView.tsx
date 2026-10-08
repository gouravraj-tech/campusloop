"use client";

import { Card, CardContent } from "@/components/ui/card";

export type MessageItem = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
};

export function ThreadView({ messages, currentUserId }: { messages: MessageItem[]; currentUserId: string }) {
  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isMine = message.senderId === currentUserId;
        return (
          <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
            <Card className={`max-w-lg ${isMine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <CardContent className="p-3 text-sm">
                {message.text}
                <div className={`mt-2 text-[10px] ${isMine ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {new Date(message.createdAt).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
