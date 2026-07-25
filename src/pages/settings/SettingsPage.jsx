export default function SettingsPage() {
  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your account and workspace preferences.</p>

      <div className="mt-8 space-y-4">
        {[
          { title: "Profile", desc: "Update your name, email and avatar." },
          { title: "Notifications", desc: "Choose what notifications you receive." },
          { title: "Security", desc: "Manage passwords and two-factor authentication." },
          { title: "Billing", desc: "View plans and manage your subscription." },
        ].map((section) => (
          <div key={section.title} className="flex items-center justify-between rounded-2xl border border-border bg-card px-6 py-4">
            <div>
              <p className="font-medium text-foreground">{section.title}</p>
              <p className="text-sm text-muted-foreground">{section.desc}</p>
            </div>
            <button className="text-sm text-sky-400 hover:underline">Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
}
