import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import { getOffers, getCachedOffers, subscribeOfferUpdates, OfferItem } from "../services/offerService";
import { nowShowingGrid } from "../data/movies";

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
  link?: string;
  bookingId?: string;
  movieTitle?: string;
  seats?: string[];
  total?: number;
  showtimeDate?: string;
  showtimeTime?: string;
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
  paymentMethod?: string;
  bookedAt: string;
  status?: string;
  createdAt?: number;
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
    item: Omit<NotificationItem, "id" | "timestamp" | "unread"> & {
      id?: string;
      timestamp?: string;
    }
  ) => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  bookingHistory: BookingHistoryItem[];
  addToBookingHistory: (
    item: Omit<BookingHistoryItem, "id" | "bookedAt"> & {
      id?: string;
      bookedAt?: string;
    }
  ) => void;
  reminders: ReleaseReminder[];
  addReminder: (reminder: ReleaseReminder) => void;
  refreshNotifications: () => Promise<void>;
  isLoading: boolean;
}

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:5000/api";

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function parseSeats(seatsRaw: any): string[] {
  if (Array.isArray(seatsRaw)) return seatsRaw;
  if (typeof seatsRaw === "string") {
    try {
      const parsed = JSON.parse(seatsRaw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      if (seatsRaw.includes(",")) {
        return seatsRaw.split(",").map((s) => s.trim());
      }
      return [seatsRaw];
    }
  }
  return [];
}

function resolveMoviePoster(title: string, fallbackPoster?: string): string {
  if (fallbackPoster && fallbackPoster.startsWith("http")) return fallbackPoster;
  const match = nowShowingGrid.find(
    (m) => m.title.toLowerCase().trim() === title.toLowerCase().trim()
  );
  return (
    match?.poster ||
    fallbackPoster ||
    "https://picsum.photos/seed/movie-ticket/400/600"
  );
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth();

  const userKey =
    user?.email ||
    sessionStorage.getItem("cinestar_active_user_email") ||
    localStorage.getItem("cinestar_active_user_email") ||
    user?.id ||
    "guest";

  const bkKey = `cinestar_booking_history_${userKey}`;
  const localNotifsKey = `cinestar_local_notifications_${userKey}`;
  const readIdsKey = `cinestar_read_notif_ids_${userKey}`;
  const remKey = `cinestar_release_reminders_${userKey}`;

  // Read notification IDs set
  const [readIds, setReadIds] = useState<string[]>(() =>
    loadFromStorage<string[]>(readIdsKey, [])
  );

  // Reminders
  const [reminders, setReminders] = useState<ReleaseReminder[]>(() =>
    loadFromStorage<ReleaseReminder[]>(remKey, [])
  );

  // Local/Custom notifications (added via addNotification)
  const [localNotifications, setLocalNotifications] = useState<NotificationItem[]>(
    () => loadFromStorage<NotificationItem[]>(localNotifsKey, [])
  );

  // Booking history
  const [bookingHistory, setBookingHistory] = useState<BookingHistoryItem[]>(() =>
    loadFromStorage<BookingHistoryItem[]>(bkKey, [])
  );

  // Active offers from admin backend
  const [liveOffers, setLiveOffers] = useState<OfferItem[]>(() => getCachedOffers());

  // Toast alert
  const [latestAlert, setLatestAlert] = useState<NotificationItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Keep track of previously seen notification IDs to detect brand-new notifications for toast alert
  const knownNotificationIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  // Update storage keys when userKey changes
  useEffect(() => {
    setReadIds(loadFromStorage<string[]>(`cinestar_read_notif_ids_${userKey}`, []));
    setReminders(loadFromStorage<ReleaseReminder[]>(`cinestar_release_reminders_${userKey}`, []));
    setLocalNotifications(
      loadFromStorage<NotificationItem[]>(`cinestar_local_notifications_${userKey}`, [])
    );
    setBookingHistory(
      loadFromStorage<BookingHistoryItem[]>(`cinestar_booking_history_${userKey}`, [])
    );
    knownNotificationIdsRef.current.clear();
    isFirstLoadRef.current = true;
  }, [userKey]);

  // Persist read IDs
  useEffect(() => {
    try {
      localStorage.setItem(readIdsKey, JSON.stringify(readIds));
    } catch {}
  }, [readIds, readIdsKey]);

  // Persist local notifications
  useEffect(() => {
    try {
      localStorage.setItem(localNotifsKey, JSON.stringify(localNotifications));
    } catch {}
  }, [localNotifications, localNotifsKey]);

  // Persist booking history
  useEffect(() => {
    try {
      localStorage.setItem(bkKey, JSON.stringify(bookingHistory));
    } catch {}
  }, [bookingHistory, bkKey]);

  // Persist reminders
  useEffect(() => {
    try {
      localStorage.setItem(remKey, JSON.stringify(reminders));
    } catch {}
  }, [reminders, remKey]);

  // Fetch remote bookings from Cinestar Admin Backend
  const fetchRemoteBookings = useCallback(async (): Promise<BookingHistoryItem[]> => {
    if (!userKey || userKey === "guest") return [];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(
        `${API_BASE_URL}/bookings/customer/${encodeURIComponent(userKey)}?_t=${Date.now()}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];

      return data.map((b: any) => {
        const cleanId = String(b.id || "").replace(/^#/, "");
        const seats = parseSeats(b.seats);
        let createdAtMs: number = Date.now();
        if (b.createdAt) {
          const parsed = new Date(b.createdAt).getTime();
          if (!isNaN(parsed)) createdAtMs = parsed;
        }

        return {
          id: cleanId,
          movieTitle: b.movieTitle || "Movie",
          poster: resolveMoviePoster(b.movieTitle || "", b.poster),
          cinema: b.cinema || "CineStar Luxury Cinema",
          date: b.date || b.screeningDate || "Today",
          time: b.time || b.screeningTime || "Showtime",
          seats,
          ticketCount: b.ticketCount || (seats.length > 0 ? seats.length : 1),
          total: Number(b.total) || Number(b.totalPrice) || 0,
          paymentMethod: b.paymentMethod || "ABA Pay",
          bookedAt: "Just now",
          createdAt: createdAtMs,
          status: b.status || "confirmed",
        };
      });
    } catch {
      // Return cached history if offline/timeout
      return [];
    }
  }, [userKey]);

  // Fetch offers from offerService
  const fetchOffers = useCallback(async () => {
    try {
      const offers = await getOffers();
      if (Array.isArray(offers)) {
        setLiveOffers(offers.filter((o) => o.status !== "Inactive"));
      }
    } catch {}
  }, []);

  // Full synchronization
  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchOffers();

      if (userKey && userKey !== "guest") {
        const remoteBookings = await fetchRemoteBookings();
        if (remoteBookings.length > 0) {
          setBookingHistory((prev) => {
            const map = new Map<string, BookingHistoryItem>();
            // Add remote bookings
            for (const b of remoteBookings) {
              map.set(b.id, b);
            }
            // Merge existing local bookings preserving posters if better
            for (const b of prev) {
              const existing = map.get(b.id);
              if (existing) {
                map.set(b.id, {
                  ...existing,
                  poster: existing.poster || b.poster,
                  cinema: existing.cinema || b.cinema,
                  createdAt: existing.createdAt || b.createdAt,
                });
              } else {
                map.set(b.id, b);
              }
            }
            return Array.from(map.values());
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchOffers, fetchRemoteBookings, userKey]);

  // Initial load and periodic polling
  useEffect(() => {
    refreshNotifications();

    // Poll every 5 seconds for dynamic synchronization
    const timer = setInterval(() => {
      refreshNotifications();
    }, 5000);

    // Subscribe to SSE for instant offer updates
    const unsubscribeSSE = subscribeOfferUpdates(() => {
      fetchOffers();
    });

    return () => {
      clearInterval(timer);
      unsubscribeSSE();
    };
  }, [refreshNotifications, fetchOffers]);

  // Generate dynamic synthesized notification list
  const notifications: NotificationItem[] = React.useMemo(() => {
    const list: NotificationItem[] = [];
    const readSet = new Set(readIds);

    // 1. Dynamic Booking Notifications
    bookingHistory.forEach((b) => {
      const isCancelled = b.status === "cancelled";
      const isRefunded = b.status === "refunded";
      const seatsStr = b.seats && b.seats.length > 0 ? b.seats.join(", ") : "General Admission";
      const bCreatedAt =
        typeof b.createdAt === "number" && !isNaN(b.createdAt) && b.createdAt > 0
          ? b.createdAt
          : b.bookedAt && !isNaN(new Date(b.bookedAt).getTime())
          ? new Date(b.bookedAt).getTime()
          : Date.now();

      const title = isCancelled
        ? "Booking Cancelled"
        : isRefunded
        ? "Booking Refunded"
        : "Booking Confirmed";

      const showtimeInfo = b.date && b.time ? ` Showtime: ${b.date} at ${b.time}.` : "";
      const notifId = `booking-${b.id}`;

      list.push({
        id: notifId,
        title,
        description: isCancelled
          ? `Your booking for "${b.movieTitle}" has been cancelled.${showtimeInfo}`
          : isRefunded
          ? `Your ticket purchase for "${b.movieTitle}" ($${b.total.toFixed(2)}) has been refunded.`
          : `Your tickets for "${b.movieTitle}" (booked just now) have been confirmed.${showtimeInfo} Seats: ${seatsStr}. Total: $${b.total.toFixed(2)}.`,
        timestamp: "Just now",
        createdAt: bCreatedAt,
        unread: !readSet.has(notifId),
        category: "Bookings",
        badge: isCancelled ? "CANCELLED" : isRefunded ? "REFUNDED" : "TICKET CONFIRMED",
        iconType: "ticket",
        link: `/ticket/${b.id}`,
        bookingId: b.id,
        movieTitle: b.movieTitle,
        seats: b.seats,
        total: b.total,
        showtimeDate: b.date,
        showtimeTime: b.time,
      });
    });

    // 2. Dynamic Promotions from Admin Backend Offers
    liveOffers.forEach((o) => {
      const notifId = `offer-${o.id}`;
      list.push({
        id: notifId,
        title: o.title,
        description: o.intro || o.caption || "Special CineStar promotion available now.",
        timestamp: o.publishDate || "Limited Time",
        unread: !readSet.has(notifId),
        category: "Promotions",
        badge: o.badge || o.tag || "SPECIAL OFFER",
        iconType: "offer",
        link: `/offers/${o.id}`,
      });
    });

    // 3. User Welcome Notification
    if (isAuthenticated && user) {
      const welcomeId = `welcome-${user.email || user.id}`;
      list.push({
        id: welcomeId,
        title: `Welcome to CineStar, ${user.name || "Movie Lover"}!`,
        description:
          "Enjoy premier screenings, Dolby Atmos sound, VIP lounge access, and exclusive rewards on every booking.",
        timestamp: "Permanent Perk",
        unread: !readSet.has(welcomeId),
        category: "Promotions",
        badge: "MEMBER PERK",
        iconType: "star",
        link: "/movies",
      });
    } else {
      const guestWelcomeId = "welcome-guest";
      list.push({
        id: guestWelcomeId,
        title: "Welcome to CineStar!",
        description:
          "Sign in to track your ticket reservations, earn member points, and unlock VIP promotional deals.",
        timestamp: "Special Notice",
        unread: !readSet.has(guestWelcomeId),
        category: "Promotions",
        badge: "WELCOME",
        iconType: "bell",
        link: "/movies",
      });
    }

    // 4. Merge any custom local notifications (e.g. reminders)
    localNotifications.forEach((ln) => {
      if (!list.some((existing) => existing.id === ln.id)) {
        list.push({
          ...ln,
          unread: !readSet.has(ln.id),
        });
      }
    });

    return list;
  }, [bookingHistory, liveOffers, isAuthenticated, user, localNotifications, readIds]);

  // Check for brand new notifications to pop up Header toast alert
  useEffect(() => {
    if (notifications.length === 0) return;

    if (isFirstLoadRef.current) {
      notifications.forEach((n) => knownNotificationIdsRef.current.add(n.id));
      isFirstLoadRef.current = false;
      return;
    }

    // Look for new unread notifications that were not previously known
    const brandNew = notifications.find(
      (n) => n.unread && !knownNotificationIdsRef.current.has(n.id)
    );

    notifications.forEach((n) => knownNotificationIdsRef.current.add(n.id));

    if (brandNew) {
      setLatestAlert(brandNew);
      // Auto-dismiss after 6 seconds
      const timer = setTimeout(() => {
        setLatestAlert((cur) => (cur?.id === brandNew.id ? null : cur));
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const clearLatestAlert = useCallback(() => {
    setLatestAlert(null);
  }, []);

  const addNotification = useCallback(
    (item: Omit<NotificationItem, "id" | "timestamp" | "unread"> & {
      id?: string;
      timestamp?: string;
      createdAt?: number;
    }) => {
      const nowMs = item.createdAt || Date.now();
      const newId = item.id || `notif-${nowMs}-${Math.random().toString(36).slice(2, 6)}`;
      const newNotif: NotificationItem = {
        id: newId,
        timestamp: item.timestamp || "Just now",
        createdAt: nowMs,
        unread: true,
        ...item,
      };

      setLocalNotifications((prev) => [newNotif, ...prev]);
      setLatestAlert(newNotif);
    },
    []
  );

  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    setReadIds((prev) => Array.from(new Set([...prev, ...allIds])));
  }, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const addToBookingHistory = useCallback(
    (item: Omit<BookingHistoryItem, "id" | "bookedAt"> & { id?: string; bookedAt?: string; createdAt?: number }) => {
      const cleanId = String(item.id || Date.now()).replace(/^#/, "");
      const nowMs = item.createdAt || Date.now();
      const newBooking: BookingHistoryItem = {
        id: cleanId,
        movieTitle: item.movieTitle,
        bookedAt: item.bookedAt || "Just now",
        poster: resolveMoviePoster(item.movieTitle, item.poster),
        cinema: item.cinema || "CineStar Luxury Cinema",
        date: item.date || "Today",
        time: item.time || "Showtime",
        seats: item.seats || [],
        ticketCount: item.ticketCount || (item.seats ? item.seats.length : 1),
        total: item.total || 0,
        paymentMethod: item.paymentMethod || "ABA Pay",
        status: item.status || "confirmed",
        createdAt: nowMs,
      };

      setBookingHistory((prev) => {
        const filtered = prev.filter((b) => b.id !== cleanId);
        return [newBooking, ...filtered];
      });
    },
    []
  );

  const addReminder = useCallback((reminder: ReleaseReminder) => {
    setReminders((prev) =>
      prev.some((r) => r.movieId === reminder.movieId) ? prev : [reminder, ...prev]
    );
  }, []);

  // Check movie release reminders every minute
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
          id: `reminder-due-${r.movieId}`,
          title: "Now Showing In Theaters",
          description: `Your reminder: "${r.title}" is officially released in theaters! Book your tickets now.`,
          category: "Promotions",
          badge: "RELEASED",
          iconType: "bell",
          link: `/movies`,
        });
      });

      setReminders((prev) =>
        prev.filter((r) => !due.some((d) => d.movieId === r.movieId))
      );
    };

    checkReleases();
    const timer = setInterval(checkReleases, 60000);
    return () => clearInterval(timer);
  }, [reminders, addNotification]);

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
        refreshNotifications,
        isLoading,
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
