export default function AnalyticsPage() {
  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
      <p className="mt-1 text-sm text-muted-foreground">Track performance and project insights.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Tasks Completed", value: "126" },
          { label: "Avg. Completion Time", value: "3.2d" },
          { label: "On-time Rate", value: "87%" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-medium text-foreground">Charts</h2>
        <p className="mt-4 text-sm text-muted-foreground">Analytics charts coming soon.</p>
      </div>
    </div>
  );
}
