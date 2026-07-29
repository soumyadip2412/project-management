import { useState, useEffect } from "react";
import { useNotificationStore } from "@/store/notification.store";
import { apiClient } from "@/lib/http";
import { Bell, CheckCheck, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotificationCenter() {
  const { notifications, unreadCount, setNotifications, markAsRead, markAllAsRead } =
    useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get("/notifications");
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setNotifications(list);
      } catch (err) {
        // Fail silently if endpoint unavailable
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [setNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await apiClient.put("/notifications/read-all");
      markAllAsRead();
    } catch (err) {
      // Fallback local update
      markAllAsRead();
    }
  };

  const handleSingleRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      markAsRead(id);
    } catch (err) {
      markAsRead(id);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-card p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground text-sm">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-xs font-semibold text-sky-400 border border-sky-500/20">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="mt-3 max-h-80 overflow-y-auto space-y-2">
              {loading ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-sky-400" />
                  <p className="mt-2 text-xs">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Inbox className="h-8 w-8 mx-auto opacity-40 mb-2" />
                  <p className="text-xs font-medium">All caught up!</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    No new notifications right now.
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => handleSingleRead(n._id)}
                    className={`cursor-pointer rounded-xl p-3 border transition-colors ${
                      n.isRead
                        ? "border-border/50 bg-background/50 text-muted-foreground"
                        : "border-sky-500/20 bg-sky-500/5 text-foreground"
                    }`}
                  >
                    <p className="text-xs font-semibold">{n.title}</p>
                    {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                      {new Date(n.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
