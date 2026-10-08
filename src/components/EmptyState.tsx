import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="flex min-h-40 flex-col items-center justify-center text-center text-muted-foreground">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 max-w-sm text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}
