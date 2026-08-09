import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Ticket, Bell, CreditCard, Star, Check, Calendar, Clock, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNotifications, NotificationItem } from "@/context/NotificationContext";

type Tab = "All" | "Bookings" | "Booking History";

function formatRelativeTime(createdAt?: number, fallback?: string) {
  if (!createdAt) return fallback || "Just now";
  const diffMs = Date.now() - createdAt;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 2) return "Yesterday";
  return new Date(createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function NotificationsPage() {
  const { notifications, bookingHistory, markAllAsRead, markAsRead } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (searchParams.get("tab") === "history") {
      setActiveTab("Booking History");
    }
  }, [searchParams]);

  function handleTabClick(tab: Tab) {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    if (tab === "Booking History") {
      params.set("tab", "history");
    } else {
      params.delete("tab");
    }
    setSearchParams(params, { replace: true });
  }

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "Bookings") return item.category === "Bookings";
    return true;
  });

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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Top thin reddish-orange gradient accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-[#f95738] to-red-600" />
      
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-10 pb-16 sm:px-6">
        {/* Title and Subtitle */}
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-4xl">
            Notifications
          </h1>
          <p className="mt-1.5 text-sm text-zinc-400 font-body">
            Stay updated with your bookings and offers.
          </p>
        </div>

        {/* Tab Row */}
        <div className="mt-8">
          <div className="flex gap-8 font-mono text-sm">
            {(["All", "Bookings", "Booking History"] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`relative pb-3 transition-colors ${
                    isActive
                      ? "font-bold text-[#f95738]"
                      : "font-medium text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab}
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

        {/* Booking History */}
        {activeTab === "Booking History" ? (
          <div className="mt-6 space-y-4">
            {bookingHistory.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800/60 bg-[#141416] py-12 text-center text-sm text-zinc-500">
                No bookings yet. Your confirmed bookings will appear here.
              </div>
            ) : (
              bookingHistory.map((item) => (
                <div
                  key={item.id}
                  className="relative flex items-start gap-4 rounded-xl border border-zinc-800/60 bg-[#141416] p-5 transition-all"
                >
                  {/* Poster */}
                  {item.poster ? (
                    <img
                      src={item.poster}
                      alt={item.movieTitle}
                      className="h-20 w-14 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800/90 shadow-inner">
                      <Ticket size={18} className="text-[#f95738]" />
                    </div>
                  )}

                  {/* Text Block */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-base font-bold text-white leading-snug">
                        {item.movieTitle}
                      </h2>
                      <span className="shrink-0 font-mono text-sm font-bold text-[#f95738]">
                        ${item.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1.5 text-sm text-zinc-400">
                      <p className="flex items-center gap-1.5">
                        <MapPin size={13} className="shrink-0" />
                        <span className="truncate">{item.cinema}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar size={13} className="shrink-0" />
                        <span>{item.date}</span>
                        <Clock size={13} className="ml-2 shrink-0" />
                        <span>{item.time}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Ticket size={13} className="shrink-0" />
                        <span>
                          {item.seats.length > 0 ? item.seats.join(", ") : "—"}
                        </span>
                      </p>
                    </div>
                    <div className="mt-3 inline-block">
                      <span className="rounded-md border border-zinc-700/80 bg-zinc-800/60 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-300">
                        Ticket Confirmed
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Notification List */
          <div className="mt-6 space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800/60 bg-[#141416] py-12 text-center text-sm text-zinc-500">
              No notifications in {activeTab}.
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id)}
                className={`relative flex items-start gap-4 rounded-xl border border-zinc-800/60 p-5 transition-all cursor-pointer ${
                  item.unread
                    ? "border-l-4 border-l-[#f95738] bg-[#141416] shadow-lg shadow-orange-950/10"
                    : "bg-[#101012] opacity-80 hover:opacity-100"
                }`}
              >
                {/* Square Icon Badge */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800/90 shadow-inner">
                  {renderIcon(item.iconType)}
                </div>

                {/* Text Block */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base font-bold text-white leading-snug">
                      {item.title}
                    </h2>
                    <span className="shrink-0 font-mono text-xs text-[#f95738] opacity-90">
                      {formatRelativeTime(item.createdAt, item.timestamp)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                  {item.badge && (
                    <div className="mt-3 inline-block">
                      <span className="rounded-md border border-zinc-700/80 bg-zinc-800/60 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-300">
                        {item.badge}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          </div>
        )}

        {/* Mark All as Read Button */}
        {activeTab !== "Booking History" && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-[#f95738] transition-opacity hover:opacity-80"
            >
              <Check size={16} strokeWidth={2.5} />
              <span>Mark all as read</span>
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
