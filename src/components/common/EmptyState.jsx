import { Button } from "@/components/ui/button";

export function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/70 p-8 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {actionLabel ? (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}