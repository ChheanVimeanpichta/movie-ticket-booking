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
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
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
  const dismissedIdsKey = `cinestar_dismissed_notif_ids_${userKey}`;
  const remKey = `cinestar_release_reminders_${userKey}`;

  // Read notification IDs set
  const [readIds, setReadIds] = useState<string[]>(() =>
    loadFromStorage<string[]>(readIdsKey, [])
  );

  // Dismissed notification IDs set
  const [dismissedIds, setDismissedIds] = useState<string[]>(() =>
    loadFromStorage<string[]>(dismissedIdsKey, [])
  );

  // Helper to deduplicate local notifications and normalize IDs
  const sanitizeLocalNotifications = (items: NotificationItem[]): NotificationItem[] => {
    const seen = new Set<string>();
    const result: NotificationItem[] = [];
    for (const item of items) {
      const cleanId = (item.id || "").replace(/#/g, "");
      const cleanBookingId = item.bookingId ? item.bookingId.replace(/#/g, "") : undefined;
      const key = cleanBookingId ? `booking-${cleanBookingId}` : cleanId;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({
          ...item,
          id: cleanId,
          bookingId: cleanBookingId,
        });
      }
    }
    return result;
  };

  // Helper to deduplicate booking history items and normalize IDs
  const sanitizeBookingHistory = (items: BookingHistoryItem[]): BookingHistoryItem[] => {
    const seen = new Set<string>();
    const result: BookingHistoryItem[] = [];
    for (const b of items) {
      const cleanId = String(b.id || "").replace(/^#/, "");
      if (!seen.has(cleanId)) {
        seen.add(cleanId);
        result.push({
          ...b,
          id: cleanId,
        });
      }
    }
    return result;
  };

  // Reminders
  const [reminders, setReminders] = useState<ReleaseReminder[]>(() =>
    loadFromStorage<ReleaseReminder[]>(remKey, [])
  );

  // Local/Custom notifications (added via addNotification)
  const [localNotifications, setLocalNotifications] = useState<NotificationItem[]>(() =>
    sanitizeLocalNotifications(loadFromStorage<NotificationItem[]>(localNotifsKey, []))
  );

  // Booking history
  const [bookingHistory, setBookingHistory] = useState<BookingHistoryItem[]>(() =>
    sanitizeBookingHistory(loadFromStorage<BookingHistoryItem[]>(bkKey, []))
  );

  // Active offers from admin backend
  const [liveOffers, setLiveOffers] = useState<OfferItem[]>(() => getCachedOffers());

  // Toast alert
  const [latestAlert, setLatestAlert] = useState<NotificationItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Keep track of previously seen notification IDs to detect brand-new notifications for toast alert
  const knownNotificationIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);
  const guestDismissedRef = useRef(false);

  // Update storage keys when userKey changes
  useEffect(() => {
    setReadIds(loadFromStorage<string[]>(`cinestar_read_notif_ids_${userKey}`, []));
    setDismissedIds(loadFromStorage<string[]>(`cinestar_dismissed_notif_ids_${userKey}`, []));
    setReminders(loadFromStorage<ReleaseReminder[]>(`cinestar_release_reminders_${userKey}`, []));
    setLocalNotifications(
      sanitizeLocalNotifications(
        loadFromStorage<NotificationItem[]>(`cinestar_local_notifications_${userKey}`, [])
      )
    );
    setBookingHistory(
      sanitizeBookingHistory(
        loadFromStorage<BookingHistoryItem[]>(`cinestar_booking_history_${userKey}`, [])
      )
    );
    knownNotificationIdsRef.current.clear();
    isFirstLoadRef.current = true;
    guestDismissedRef.current = false;
  }, [userKey]);

  // Persist read IDs
  useEffect(() => {
    try {
      localStorage.setItem(readIdsKey, JSON.stringify(readIds));
    } catch {}
  }, [readIds, readIdsKey]);

  // Persist dismissed IDs
  useEffect(() => {
    try {
      localStorage.setItem(dismissedIdsKey, JSON.stringify(dismissedIds));
    } catch {}
  }, [dismissedIds, dismissedIdsKey]);

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
            // Add remote bookings with normalized cleanId
            for (const b of remoteBookings) {
              const cleanId = String(b.id || "").replace(/^#/, "");
              map.set(cleanId, { ...b, id: cleanId });
            }
            // Merge existing local bookings preserving posters if better
            for (const b of prev) {
              const cleanId = String(b.id || "").replace(/^#/, "");
              const existing = map.get(cleanId);
              if (existing) {
                map.set(cleanId, {
                  ...existing,
                  poster: existing.poster || b.poster,
                  cinema: existing.cinema || b.cinema,
                  createdAt: existing.createdAt || b.createdAt,
                });
              } else {
                map.set(cleanId, { ...b, id: cleanId });
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
    const dismissedSet = new Set(dismissedIds);

    // 1. Guest Welcome Notification (Exclusive alert for visitors who haven't logged in)
    if (!isAuthenticated) {
      const guestWelcomeId = "welcome-guest";
      if (!dismissedSet.has(guestWelcomeId)) {
        list.push({
          id: guestWelcomeId,
          title: "Welcome to CineStar!",
          description:
            "Sign in to track your ticket reservations, earn member points, and unlock VIP promotional deals.",
          timestamp: "Just now",
          unread: !readSet.has(guestWelcomeId),
          category: "Promotions",
          badge: "WELCOME",
          iconType: "bell",
          link: "/login",
        });
      }
      // When not logged in, ONLY show the Welcome notification — exclude all old offers
      return list;
    }

    // 2. Dynamic Booking Notifications (For logged-in users)
    const seenBookingKeys = new Set<string>();

    bookingHistory.forEach((b) => {
      const cleanBId = String(b.id || "").replace(/^#/, "");
      const notifId = `booking-${cleanBId}`;
      if (
        dismissedSet.has(notifId) ||
        dismissedSet.has(`booking-${b.id}`) ||
        dismissedSet.has(b.id) ||
        dismissedSet.has(cleanBId)
      ) {
        return;
      }

      // Deduplicate bookingHistory items so same booking is never processed twice
      const dedupeKey = cleanBId || `${b.movieTitle}-${(b.seats || []).join(",")}`;
      if (seenBookingKeys.has(dedupeKey)) return;
      seenBookingKeys.add(dedupeKey);

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
        unread: !readSet.has(notifId) && !readSet.has(`booking-${b.id}`) && !readSet.has(cleanBId),
        category: "Bookings",
        badge: isCancelled ? "CANCELLED" : isRefunded ? "REFUNDED" : "TICKET CONFIRMED",
        iconType: "ticket",
        link: `/ticket/${cleanBId}`,
        bookingId: cleanBId,
        movieTitle: b.movieTitle,
        seats: b.seats,
        total: b.total,
        showtimeDate: b.date,
        showtimeTime: b.time,
      });
    });

    // 3. Dynamic Promotions from Admin Backend Offers (For logged-in users)
    liveOffers.forEach((o) => {
      const notifId = `offer-${o.id}`;
      if (dismissedSet.has(notifId)) return;

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

    // 4. User Welcome Notification (For logged-in members)
    if (user) {
      const welcomeId = `welcome-${user.email || user.id}`;
      if (!dismissedSet.has(welcomeId)) {
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
      }
    }

    // 5. Merge any custom local notifications (e.g. reminders)
    localNotifications.forEach((ln) => {
      const cleanLnId = (ln.id || "").replace(/#/g, "");
      const cleanBookingId = (ln.bookingId || "").replace(/#/g, "");

      if (
        dismissedSet.has(ln.id) ||
        dismissedSet.has(cleanLnId) ||
        (cleanBookingId && (dismissedSet.has(`booking-${cleanBookingId}`) || dismissedSet.has(cleanBookingId)))
      ) {
        return;
      }

      // Check if this notification already exists in list
      const alreadyExists = list.some((existing) => {
        const cleanExistingId = (existing.id || "").replace(/#/g, "");
        const cleanExistingBookingId = (existing.bookingId || "").replace(/#/g, "");

        if (cleanExistingId === cleanLnId) return true;
        if (cleanBookingId && cleanExistingBookingId && cleanBookingId === cleanExistingBookingId) return true;
        if (cleanBookingId && cleanExistingId === `booking-${cleanBookingId}`) return true;

        if (
          ln.category === "Bookings" &&
          existing.category === "Bookings" &&
          ln.movieTitle &&
          existing.movieTitle &&
          ln.movieTitle.trim().toLowerCase() === existing.movieTitle.trim().toLowerCase() &&
          Array.isArray(ln.seats) &&
          Array.isArray(existing.seats) &&
          ln.seats.slice().sort().join(",") === existing.seats.slice().sort().join(",")
        ) {
          return true;
        }

        return false;
      });

      if (!alreadyExists) {
        list.push({
          ...ln,
          id: cleanLnId,
          bookingId: cleanBookingId || ln.bookingId,
          unread: !readSet.has(ln.id) && !readSet.has(cleanLnId),
        });
      }
    });

    return list;
  }, [bookingHistory, liveOffers, isAuthenticated, user, localNotifications, readIds, dismissedIds]);

  // Check for brand new notifications to pop up Header toast alert
  useEffect(() => {
    if (notifications.length === 0) return;

    if (!isAuthenticated) {
      // When not logged in: Keep the Welcome to CineStar alert!
      const guestNotif = notifications.find((n) => n.id === "welcome-guest");
      if (guestNotif && guestNotif.unread && !guestDismissedRef.current) {
        setLatestAlert(guestNotif);
      }
      // Track IDs so dynamic offers do NOT alert while user is a guest
      notifications.forEach((n) => knownNotificationIdsRef.current.add(n.id));
      isFirstLoadRef.current = false;
      return;
    }

    // When logged in:
    // If the welcome-guest alert was active, dismiss it
    setLatestAlert((cur) => (cur?.id === "welcome-guest" ? null : cur));

    if (isFirstLoadRef.current) {
      // On first load after login, alert the latest unread promotion offer or booking
      const initialOffer = notifications.find(
        (n) => n.unread && (n.category === "Promotions" || n.category === "Bookings") && n.id !== "welcome-guest"
      );
      notifications.forEach((n) => knownNotificationIdsRef.current.add(n.id));
      isFirstLoadRef.current = false;

      if (initialOffer) {
        setLatestAlert(initialOffer);
        const timer = setTimeout(() => {
          setLatestAlert((cur) => (cur?.id === initialOffer.id ? null : cur));
        }, 6000);
        return () => clearTimeout(timer);
      }
      return;
    }

    // When logged in: dynamic offer and booking updates will alert as usual
    const brandNew = notifications.find(
      (n) => n.unread && !knownNotificationIdsRef.current.has(n.id) && n.id !== "welcome-guest"
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
  }, [notifications, isAuthenticated]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const clearLatestAlert = useCallback(() => {
    if (!isAuthenticated) {
      guestDismissedRef.current = true;
    }
    setLatestAlert(null);
  }, [isAuthenticated]);

  const addNotification = useCallback(
    (item: Omit<NotificationItem, "id" | "timestamp" | "unread"> & {
      id?: string;
      timestamp?: string;
      createdAt?: number;
    }) => {
      const nowMs = item.createdAt || Date.now();
      const rawId = item.id || `notif-${nowMs}-${Math.random().toString(36).slice(2, 6)}`;
      const cleanId = rawId.replace(/#/g, "");
      const cleanBookingId = item.bookingId ? item.bookingId.replace(/#/g, "") : undefined;

      const newNotif: NotificationItem = {
        ...item,
        id: cleanId,
        bookingId: cleanBookingId,
        timestamp: item.timestamp || "Just now",
        createdAt: nowMs,
        unread: true,
      };

      setLocalNotifications((prev) => {
        const filtered = prev.filter((p) => {
          const pCleanId = p.id.replace(/#/g, "");
          if (pCleanId === cleanId) return false;
          if (cleanBookingId && p.bookingId && p.bookingId.replace(/#/g, "") === cleanBookingId) {
            return false;
          }
          if (
            item.category === "Bookings" &&
            p.category === "Bookings" &&
            item.movieTitle &&
            p.movieTitle &&
            item.movieTitle.trim().toLowerCase() === p.movieTitle.trim().toLowerCase() &&
            Array.isArray(item.seats) &&
            Array.isArray(p.seats) &&
            item.seats.slice().sort().join(",") === p.seats.slice().sort().join(",")
          ) {
            return false;
          }
          return true;
        });
        return [newNotif, ...filtered];
      });
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

  const dismissNotification = useCallback((id: string) => {
    setDismissedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const clearAllNotifications = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    setDismissedIds((prev) => Array.from(new Set([...prev, ...allIds])));
  }, [notifications]);

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
        const filtered = prev.filter((b) => String(b.id).replace(/^#/, "") !== cleanId);
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
        dismissNotification,
        clearAllNotifications,
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
