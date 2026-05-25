export function LoadingScreen({ fullScreen = false }) {
  return (
    <div className={fullScreen ? "grid min-h-screen place-items-center" : "grid place-items-center py-16"}>
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
        Loading Project Camp...
      </div>
    </div>
  );
}