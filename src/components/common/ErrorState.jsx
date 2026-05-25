import { Button } from "@/components/ui/button";

export function ErrorState({ title = "Something went wrong", description = "Please try again.", onRetry }) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
      <h3 className="text-lg font-semibold text-red-200">{title}</h3>
      <p className="mt-2 text-sm text-red-100/80">{description}</p>
      {onRetry ? (
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}