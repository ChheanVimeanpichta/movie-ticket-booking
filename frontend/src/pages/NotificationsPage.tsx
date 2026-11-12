import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Ticket,
  Bell,
  CreditCard,
  Star,
  Check,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  RefreshCw,
  User,
  Film,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNotifications, NotificationItem } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";

type Tab = "All" | "Bookings" | "Promotions" | "Booking History";

function formatRelativeTime(createdAt?: number, fallback?: string): string {
  if (!createdAt || isNaN(createdAt)) return fallback || "Just now";
  const diffMs = Date.now() - createdAt;
  if (diffMs < 0) return "Just now";
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function resolveItemCreatedAt(item: NotificationItem): number {
  if (typeof item.createdAt === "number" && !isNaN(item.createdAt) && item.createdAt > 0) {
    return item.createdAt;
  }
  const idNumbers = item.id.match(/\d{12,14}/);
  if (idNumbers) {
    const parsed = Number(idNumbers[0]);
    if (!isNaN(parsed) && parsed > 1600000000000 && parsed <= Date.now() + 60000) {
      return parsed;
    }
  }
  return Date.now();
}

function getNotificationDescription(item: NotificationItem): string {
  const createdAt = resolveItemCreatedAt(item);
  const rel = formatRelativeTime(createdAt, item.timestamp);
  const timePhrase = rel.toLowerCase() === "just now" ? "just now" : rel;

  if (item.category === "Bookings") {
    if (item.movieTitle) {
      const seatsStr =
        item.seats && item.seats.length > 0 ? item.seats.join(", ") : "General";
      const totalStr =
        item.total !== undefined ? ` Total: $${item.total.toFixed(2)}.` : "";
      const showtimeStr =
        item.showtimeDate && item.showtimeTime
          ? ` Showtime: ${item.showtimeDate} at ${item.showtimeTime}.`
          : "";

      if (item.badge === "CANCELLED") {
        return `Your booking for "${item.movieTitle}" has been cancelled (booked ${timePhrase}).${showtimeStr}`;
      }
      if (item.badge === "REFUNDED") {
        return `Your ticket purchase for "${item.movieTitle}" has been refunded (booked ${timePhrase}).${totalStr}`;
      }

      return `Your tickets for "${item.movieTitle}" (booked ${timePhrase}) have been confirmed.${showtimeStr} Seats: ${seatsStr}.${totalStr}`;
    }

    // Support legacy descriptions stored in localStorage matching (Date at Time) e.g. (Tue, Nov 10 at 18:30)
    const match = item.description.match(
      /\((?:[A-Za-z]+,\s*)?[A-Za-z]+\s+\d+\s+at\s+[\d:]+(?:\s*[AP]M)?\)/i
    );
    if (match) {
      const showtimeContent = match[0].slice(1, -1);
      return item.description
        .replace(match[0], `(booked ${timePhrase})`)
        .replace("have been confirmed.", `have been confirmed. Showtime: ${showtimeContent}.`);
    }
  }

  return item.description;
}

export default function NotificationsPage() {
  const {
    notifications,
    bookingHistory,
    markAllAsRead,
    markAsRead,
    refreshNotifications,
    isLoading,
  } = useNotifications();
  const { isAuthenticated, openLoginPopup } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "history" || tabParam === "booking-history") return "Booking History";
    if (tabParam === "bookings") return "Bookings";
    if (tabParam === "promotions") return "Promotions";
    return "All";
  });

  const [, setTick] = useState(0);

  // Tick relative time every 10 seconds so "Just now" updates to "1 min ago", "10 mins ago" automatically
  useEffect(() => {
    const timer = setInterval(() => setTick((n) => n + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  // Listen to searchParams changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "history" || tabParam === "booking-history") {
      setActiveTab("Booking History");
    } else if (tabParam === "bookings") {
      setActiveTab("Bookings");
    } else if (tabParam === "promotions") {
      setActiveTab("Promotions");
    } else if (tabParam === "all") {
      setActiveTab("All");
    }
  }, [searchParams]);

  function handleTabClick(tab: Tab) {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    if (tab === "Booking History") {
      params.set("tab", "history");
    } else if (tab === "Bookings") {
      params.set("tab", "bookings");
    } else if (tab === "Promotions") {
      params.set("tab", "promotions");
    } else {
      params.delete("tab");
    }
    setSearchParams(params, { replace: true });
  }

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "Bookings") return item.category === "Bookings";
    if (activeTab === "Promotions") return item.category === "Promotions";
    return true;
  });

  const unreadCountInTab = filteredNotifications.filter((n) => n.unread).length;
  const unreadBookingsCount = notifications.filter(
    (n) => n.category === "Bookings" && n.unread
  ).length;
  const unreadPromotionsCount = notifications.filter(
    (n) => n.category === "Promotions" && n.unread
  ).length;
  const totalUnreadCount = notifications.filter((n) => n.unread).length;

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id);
    if (item.link) {
      navigate(item.link);
    }
  };

  const renderIcon = (type: NotificationItem["iconType"]) => {
    switch (type) {
      case "ticket":
        return <Ticket size={18} className="text-[#f95738]" />;
      case "bell":
        return <Bell size={18} className="text-[#f95738]" />;
      case "offer":
        return <CreditCard size={18} className="text-[#f95738]" />;
      case "star":
        return <Star size={18} className="text-[#f95738]" />;
      default:
        return <Bell size={18} className="text-[#f95738]" />;
    }
  };

  const tabs: Tab[] = ["All", "Bookings", "Promotions", "Booking History"];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Top thin reddish-orange gradient accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-[#f95738] to-red-600" />

      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-10 pb-16 sm:px-6">
        {/* Title and Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-4xl">
              Notifications
            </h1>
            <p className="mt-1.5 text-sm text-zinc-400 font-body">
              Stay dynamically updated with your bookings, ticket confirmations, and exclusive promotions.
            </p>
          </div>

          <button
            onClick={() => refreshNotifications()}
            title="Refresh notifications"
            className="self-start sm:self-center flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#141416] px-3.5 py-2 text-xs font-mono font-medium text-zinc-300 hover:text-white hover:border-[#f95738]/50 transition-all"
          >
            <RefreshCw
              size={13}
              className={`text-[#f95738] ${isLoading ? "animate-spin" : ""}`}
            />
            <span>{isLoading ? "Syncing..." : "Sync Live"}</span>
          </button>
        </div>

        {/* Tab Row */}
        <div className="mt-8">
          <div className="flex flex-wrap gap-4 sm:gap-8 font-mono text-sm">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              let badgeNumber = 0;
              if (tab === "All") badgeNumber = totalUnreadCount;
              if (tab === "Bookings") badgeNumber = unreadBookingsCount;
              if (tab === "Promotions") badgeNumber = unreadPromotionsCount;
              if (tab === "Booking History") badgeNumber = bookingHistory.length;

              return (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`relative flex items-center gap-2 pb-3 transition-colors ${
                    isActive
                      ? "font-bold text-[#f95738]"
                      : "font-medium text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <span>{tab}</span>
                  {badgeNumber > 0 && (
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        tab === "Booking History"
                          ? "bg-zinc-800 text-zinc-300"
                          : "bg-[#f95738] text-white shadow-sm shadow-orange-900/50"
                      }`}
                    >
                      {badgeNumber}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#f95738]" />
                  )}
                </button>
              );
            })}
          </div>
          {/* Full-width Divider */}
          <div className="border-b border-zinc-800/80" />
        </div>

        {/* Tab Content */}
        {activeTab === "Booking History" ? (
          /* Booking History Tab */
          <div className="mt-6 space-y-4">
            {!isAuthenticated && bookingHistory.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800/60 bg-[#141416] p-8 text-center">
                <User size={36} className="mx-auto mb-3 text-zinc-500" />
                <h3 className="text-base font-bold text-white">Sign in to view your bookings</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Log into your CineStar account to synchronize your real-time booking history and ticket passes.
                </p>
                <div className="mt-5 flex justify-center">
                  <button
                    onClick={() => openLoginPopup()}
                    className="rounded-xl bg-[#f95738] px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-lg shadow-orange-950/40 hover:bg-orange-600 transition-all"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            ) : bookingHistory.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800/60 bg-[#141416] p-10 text-center">
                <Film size={36} className="mx-auto mb-3 text-zinc-600" />
                <h3 className="text-base font-bold text-white">No bookings yet</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Your confirmed movie ticket reservations will dynamically appear here.
                </p>
                <div className="mt-5 flex justify-center">
                  <Link
                    to="/movies"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#f95738] px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-lg shadow-orange-950/40 hover:bg-orange-600 transition-all"
                  >
                    <span>Browse Movies</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              bookingHistory.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col sm:flex-row items-start gap-4 rounded-xl border border-zinc-800/70 bg-[#141416] p-5 transition-all hover:border-[#f95738]/40 hover:shadow-xl hover:shadow-orange-950/10"
                >
                  {/* Poster */}
                  {item.poster ? (
                    <img
                      src={item.poster}
                      alt={item.movieTitle}
                      className="h-24 w-16 shrink-0 rounded-lg object-cover shadow-md"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-800/90 shadow-inner">
                      <Ticket size={20} className="text-[#f95738]" />
                    </div>
                  )}

                  {/* Text Block */}
                  <div className="min-w-0 flex-1 w-full">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-bold text-white leading-snug">
                          {item.movieTitle}
                        </h2>
                        <p className="font-mono text-xs text-zinc-500 mt-0.5">
                          ID: #{item.id}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-base font-black text-[#f95738]">
                        ${item.total.toFixed(2)}
                      </span>
                    </div>

                    <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-zinc-400 font-body">
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin size={13} className="shrink-0 text-[#f95738]" />
                        <span className="truncate">{item.cinema}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar size={13} className="shrink-0 text-[#f95738]" />
                        <span>{item.date}</span>
                        <Clock size={13} className="ml-2 shrink-0 text-[#f95738]" />
                        <span>{item.time}</span>
                        {item.createdAt && (
                          <span className="ml-2 font-mono text-[11px] text-[#f95738]/90">
                            &bull; Booked {formatRelativeTime(item.createdAt)}
                          </span>
                        )}
                      </p>
                      <p className="flex items-center gap-1.5 sm:col-span-2">
                        <Ticket size={13} className="shrink-0 text-[#f95738]" />
                        <span>
                          Seats:{" "}
                          <span className="font-mono text-zinc-300 font-medium">
                            {item.seats && item.seats.length > 0 ? item.seats.join(", ") : "General"}
                          </span>
                        </span>
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/60 pt-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md border border-zinc-700/80 bg-zinc-800/60 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-300">
                          {item.status ? item.status.toUpperCase() : "TICKET CONFIRMED"}
                        </span>
                        {item.paymentMethod && (
                          <span className="rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                            {item.paymentMethod}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => navigate(`/ticket/${item.id}`)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#f95738] px-3.5 py-1.5 font-mono text-xs font-bold text-white shadow-md hover:bg-orange-600 transition-colors"
                      >
                        <span>View Ticket</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Notification List for All / Bookings / Promotions */
          <div className="mt-6 space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800/60 bg-[#141416] py-14 text-center">
                <Bell size={32} className="mx-auto mb-3 text-zinc-600" />
                <p className="text-sm text-zinc-400 font-medium">
                  No notifications in {activeTab}.
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  New cinema updates, ticket releases, and promotions will be delivered here dynamically.
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`group relative flex items-start gap-4 rounded-xl border p-5 transition-all cursor-pointer ${
                    item.unread
                      ? "border-l-4 border-l-[#f95738] border-zinc-800/80 bg-[#141416] shadow-lg shadow-orange-950/10 hover:border-[#f95738]/60"
                      : "border-zinc-800/50 bg-[#101012] opacity-85 hover:opacity-100 hover:border-zinc-700/80"
                  }`}
                >
                  {/* Square Icon Badge */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-800/90 shadow-inner">
                    {renderIcon(item.iconType)}
                  </div>

                  {/* Text Block */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {item.unread && (
                          <span className="h-2 w-2 rounded-full bg-[#f95738] shrink-0 animate-pulse" />
                        )}
                        <h2 className="text-base font-bold text-white leading-snug truncate">
                          {item.title}
                        </h2>
                      </div>
                      <span className="shrink-0 font-mono text-xs text-[#f95738] opacity-90">
                        {formatRelativeTime(resolveItemCreatedAt(item), item.timestamp)}
                      </span>
                    </div>

                    <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed font-body">
                      {getNotificationDescription(item)}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      {item.badge && (
                        <span className="rounded-md border border-zinc-700/80 bg-zinc-800/60 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-300">
                          {item.badge}
                        </span>
                      )}

                      {item.link && (
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#f95738] group-hover:translate-x-1 transition-transform">
                          <span>
                            {item.category === "Bookings"
                              ? "View Ticket"
                              : item.iconType === "offer"
                              ? "Claim Offer"
                              : "View Details"}
                          </span>
                          <ArrowRight size={12} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Mark All as Read Button */}
        {activeTab !== "Booking History" && filteredNotifications.length > 0 && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={markAllAsRead}
              disabled={unreadCountInTab === 0}
              className={`inline-flex items-center gap-2 font-mono text-sm font-semibold transition-opacity ${
                unreadCountInTab > 0
                  ? "text-[#f95738] hover:opacity-80 cursor-pointer"
                  : "text-zinc-600 cursor-not-allowed"
              }`}
            >
              <Check size={16} strokeWidth={2.5} />
              <span>
                {unreadCountInTab > 0 ? "Mark all as read" : "All notifications read"}
              </span>
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
