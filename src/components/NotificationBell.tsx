import { useEffect, useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { markNotificationsRead, readStore, subscribeToStore, type PlatformNotification } from '../services/recruitmentStore';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const store = await readStore();
        setNotifications(store.notifications.filter((notification) => notification.userEmail === user?.email));
      } catch {
        setNotifications([]);
      }
    };
    load();
    return subscribeToStore(load);
  }, [user?.email]);

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications]);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          markNotificationsRead(user.email);
        }}
        className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label="Open notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{unreadCount}</span>}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No notifications yet.</p>
            ) : notifications.map((notification) => (
              <div key={notification.id} className="border-b border-slate-100 p-4 last:border-b-0 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{notification.title}</p>
                <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">{notification.message}</p>
                <p className="mt-2 text-xs text-slate-400">{new Date(notification.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
