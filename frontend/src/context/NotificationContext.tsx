import React, { createContext, useContext, useState, useEffect } from "react";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  createdAt?: number;
  unread: boolean;
  category: "Bookings" | "Promotions";
  badge?: string;
  iconType: "ticket" | "bell" | "offer" | "star";
}

export interface BookingHistoryItem {
  id: string;
  movieTitle: string;
  poster?: string;
  cinema: string;
  date: string;
  time: string;
  seats: string[];
  ticketCount: number;
  total: number;
  bookedAt: string;
}

export interface ReleaseReminder {
  movieId: string;
  title: string;
  releaseDate: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  latestAlert: NotificationItem | null;
  clearLatestAlert: () => void;
  addNotification: (
    item: Omit<NotificationItem, "id" | "timestamp" | "unread"> & { timestamp?: string }
  ) => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  bookingHistory: BookingHistoryItem[];
  addToBookingHistory: (
    item: Omit<BookingHistoryItem, "id" | "bookedAt"> & { id?: string; bookedAt?: string }
  ) => void;
  reminders: ReleaseReminder[];
  addReminder: (reminder: ReleaseReminder) => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function loadFromStorage<T>(email: string, key: string, fallback: T): T {
  if (!email) return fallback;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialEmail =
    sessionStorage.getItem("cinestar_active_user_email") ||
    localStorage.getItem("cinestar_active_user_email") ||
    "";

  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadFromStorage(initialEmail, `cinestar_notifications_${initialEmail}`, INITIAL_NOTIFICATIONS)
  );
  const [bookingHistory, setBookingHistory] = useState<BookingHistoryItem[]>(() =>
    loadFromStorage(initialEmail, `cinestar_booking_history_${initialEmail}`, [])
  );
  const [reminders, setReminders] = useState<ReleaseReminder[]>(() =>
    loadFromStorage(initialEmail, `cinestar_release_reminders_${initialEmail}`, [])
  );
  const [latestAlert, setLatestAlert] = useState<NotificationItem | null>(null);

  const [userEmail, setUserEmail] = useState(initialEmail);

  const bkKey = `cinestar_booking_history_${userEmail}`;
  const ntfKey = `cinestar_notifications_${userEmail}`;
  const remKey = `cinestar_release_reminders_${userEmail}`;

  useEffect(() => {
    const check = () => {
      const email =
        sessionStorage.getItem("cinestar_active_user_email") ||
        localStorage.getItem("cinestar_active_user_email") ||
        "";
      if (email !== userEmail) {
        setUserEmail(email);
        if (!email) {
          setNotifications(INITIAL_NOTIFICATIONS);
          setBookingHistory([]);
          setReminders([]);
        } else {
          setNotifications(loadFromStorage(email, `cinestar_notifications_${email}`, INITIAL_NOTIFICATIONS));
          setBookingHistory(loadFromStorage(email, `cinestar_booking_history_${email}`, []));
          setReminders(loadFromStorage(email, `cinestar_release_reminders_${email}`, []));
        }
      }
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === "cinestar_active_user_email") check();
    };
    const authHandler = () => check();
    window.addEventListener("storage", onStorage);
    window.addEventListener("cinestar_auth_changed", authHandler);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cinestar_auth_changed", authHandler);
    };
  }, [userEmail]);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem(ntfKey, JSON.stringify(notifications));
    }
  }, [notifications, ntfKey, userEmail]);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem(bkKey, JSON.stringify(bookingHistory));
    }
  }, [bookingHistory, bkKey, userEmail]);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem(remKey, JSON.stringify(reminders));
    }
  }, [reminders, remKey, userEmail]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const clearLatestAlert = () => {
    setLatestAlert(null);
  };

  const addNotification = (
    item: Omit<NotificationItem, "id" | "timestamp" | "unread"> & { timestamp?: string }
  ) => {
    const newNotif: NotificationItem = {
      id: Date.now().toString(),
      timestamp: item.timestamp || "Just now",
      createdAt: Date.now(),
      unread: true,
      ...item,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setLatestAlert(newNotif);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const addToBookingHistory = (
    item: Omit<BookingHistoryItem, "id" | "bookedAt"> & { id?: string; bookedAt?: string }
  ) => {
    const newBooking: BookingHistoryItem = {
      id: item.id || Date.now().toString(),
      bookedAt: item.bookedAt || "Just now",
      ...item,
    };
    setBookingHistory((prev) => [newBooking, ...prev]);
  };

  const addReminder = (reminder: ReleaseReminder) => {
    setReminders((prev) =>
      prev.some((r) => r.movieId === reminder.movieId)
        ? prev
        : [reminder, ...prev]
    );
  };

  useEffect(() => {
    const checkReleases = () => {
      const now = new Date();
      const due = reminders.filter((r) => {
        const release = new Date(r.releaseDate);
        return !isNaN(release.getTime()) && now >= release;
      });
      if (due.length === 0) return;
      due.forEach((r) => {
        addNotification({
          title: "Now Showing",
          description: `Your reminder: "${r.title}" is now in theaters! Book your tickets now.`,
          category: "Promotions",
          badge: "RELEASED",
          iconType: "ticket",
        });
      });
      setReminders((prev) =>
        prev.filter((r) => !due.some((d) => d.movieId === r.movieId))
      );
    };
    checkReleases();
    const timer = setInterval(checkReleases, 60000);
    return () => clearInterval(timer);
  }, [reminders]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        latestAlert,
        clearLatestAlert,
        addNotification,
        markAllAsRead,
        markAsRead,
        bookingHistory,
        addToBookingHistory,
        reminders,
        addReminder,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
