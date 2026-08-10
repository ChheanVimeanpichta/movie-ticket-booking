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
    item: Omit<BookingHistoryItem, "id" | "bookedAt">
  ) => void;
  reminders: ReleaseReminder[];
  addReminder: (reminder: ReleaseReminder) => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Booking Confirmed",
    description: "Your tickets for Avatar: The Way of Water (IMAX) have been confirmed.",
    timestamp: "2 mins ago",
    unread: true,
    category: "Bookings",
    badge: "Ticket",
    iconType: "ticket",
  },
  {
    id: "2",
    title: "Showtime Reminder",
    description: "Don't forget! Your movie starts in 2 hours at Hall 4.",
    timestamp: "1 hour ago",
    unread: true,
    category: "Bookings",
    badge: "IMAX",
    iconType: "bell",
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem("cinestar_notifications");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse notifications from localStorage", e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [latestAlert, setLatestAlert] = useState<NotificationItem | null>(null);

  const [bookingHistory, setBookingHistory] = useState<BookingHistoryItem[]>(() => {
    const saved = localStorage.getItem("cinestar_booking_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse booking history from localStorage", e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("cinestar_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(
      "cinestar_booking_history",
      JSON.stringify(bookingHistory)
    );
  }, [bookingHistory]);

  const [reminders, setReminders] = useState<ReleaseReminder[]>(() => {
    const saved = localStorage.getItem("cinestar_release_reminders_v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse release reminders from localStorage", e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(
      "cinestar_release_reminders_v2",
      JSON.stringify(reminders)
    );
  }, [reminders]);

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
    item: Omit<BookingHistoryItem, "id" | "bookedAt">
  ) => {
    const newBooking: BookingHistoryItem = {
      id: Date.now().toString(),
      bookedAt: "Just now",
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
