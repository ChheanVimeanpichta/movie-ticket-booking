import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Settings,
  ChevronRight,
  MapPin,
  Ticket,
  ArrowUpRight,
  CreditCard,
  History,
  User,
  X,
  Upload,
  LogOut,
  Shield,
  ExternalLink,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNotifications } from "@/context/NotificationContext";
import { useProfile, type Profile } from "@/context/ProfileContext";
import { useAuth } from "@/context/AuthContext";
import { useMovies } from "@/context/MovieContext";

const PAYMENT_METHODS = [
  {
    id: "aba",
    name: "ABA Pay",
    logoClass: "bg-white text-black",
    logoText: "ABA",
  },
  {
    id: "acleda",
    name: "ACLEDA",
    logoClass: "bg-[#1B4FA0] text-white",
    logoText: "ACLEDA",
  },
  {
    id: "wing",
    name: "Wing",
    logoClass: "bg-[#14A44D] text-white",
    logoText: "Wing",
  },
];

function BookingCard({
  id,
  poster,
  title,
  badge,
  badgeOutlined,
  date,
  time,
  cinema,
  seats,
}: {
  id: string;
  poster: string;
  title: string;
  badge: string;
  badgeOutlined?: boolean;
  date: string;
  time: string;
  cinema: string;
  seats: string[];
}) {
  const navigate = useNavigate();
  return (
    <div className="flex gap-4 rounded-xl border border-cine-border bg-cine-card p-4">
      <img
        src={poster}
        alt={`${title} poster`}
        className="h-24 w-16 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="truncate text-sm font-bold text-cine-white">{title}</h3>
          <span
            className={`shrink-0 rounded px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider ${
              badgeOutlined
                ? "border border-cine-border text-cine-text-light"
                : "bg-cine-red text-white"
            }`}
          >
            {badge}
          </span>
        </div>
        <p className="mt-1 text-xs text-cine-text">
          {date} &bull; {time}
        </p>
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-cine-text">
          <MapPin size={12} className="shrink-0 text-cine-red" />
          <span className="truncate">{cinema}</span>
          <Ticket size={12} className="ml-1 shrink-0 text-cine-red" />
          <span className="truncate">{seats.join(" · ")}</span>
        </p>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => navigate(`/ticket/${id}`)}
            className="rounded-lg bg-cine-red px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-cine-red/80"
          >
            View Ticket
          </button>
          <button
            aria-label="Share ticket"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-cine-border text-cine-text-light transition-colors hover:border-cine-red hover:text-cine-white"
          >
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { bookingHistory } = useNotifications();
  const { profile, updateProfile, resetProfile } = useProfile();
  const { isAuthenticated, user, logout, openLoginPopup, updateUser } = useAuth();
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [draft, setDraft] = useState<Profile>(profile);

  const displayName = isAuthenticated && user ? (user.name || profile.name) : "";
  const displayAvatar = isAuthenticated && user?.avatar ? user.avatar : "";

  const userRole = user?.role || (user?.email?.toLowerCase() === "admin@gmail.com" ? "Admin" : "Customer");
  const isElevatedUser = isAuthenticated && (userRole === "Admin" || userRole === "Staff");
  const roleBadgeText = userRole === "Admin" ? "ADMIN" : userRole === "Staff" ? "STAFF" : "ELITE";
  const roleBadgeStyle = userRole === "Admin"
    ? "bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md shadow-red-600/30"
    : userRole === "Staff"
    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30"
    : "bg-cine-red text-white";

  useEffect(() => {
    if (isAuthenticated && user) {
      updateProfile({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        avatar: user.avatar || "",
      });
    }
  }, [isAuthenticated, user?.email, user?.avatar, user?.name, user?.phone]);

  function openEditProfile() {
    setDraft({
      ...profile,
      name: user?.name || profile.name,
      email: user?.email || profile.email,
      phone: user?.phone || profile.phone,
      avatar: user?.avatar || "",
    });
    setShowEditProfile(true);
  }

  function saveEditProfile() {
    const updatedName = draft.name.trim() || profile.name;
    const updatedAvatar = draft.avatar || "";
    updateProfile({
      name: updatedName,
      avatar: updatedAvatar,
      email: draft.email,
      phone: draft.phone,
      city: draft.city,
      bio: draft.bio,
    });
    if (isAuthenticated) {
      updateUser({
        avatar: updatedAvatar,
        name: updatedName,
        email: draft.email,
        phone: draft.phone,
      });
    }
    setShowEditProfile(false);
  }

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 256;
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setDraft({ ...draft, avatar: canvas.toDataURL("image/jpeg", 0.85) });
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  const { movies: allMovies } = useMovies();
  const [dbBookings, setDbBookings] = useState<any[]>([]);

  useEffect(() => {
    const emailOrId = user?.email || profile.email || user?.id;
    if (!emailOrId) return;

    let isMounted = true;
    fetch(`http://localhost:5000/api/bookings/customer/${encodeURIComponent(emailOrId)}`)
      .then((res) => {
        if (!res.ok) return [];
        return res.json();
      })
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setDbBookings(data);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch remote customer bookings:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.email, user?.id, profile.email]);

  const accountRows = [
    ...(isElevatedUser
      ? [
          {
            label: userRole === "Staff" ? "Staff Operations Portal" : "Admin Management Suite",
            icon: Shield,
            onClick: () => window.open("http://localhost:5173/admin", "_blank"),
          },
        ]
      : []),
    { label: "Edit Profile", icon: User, onClick: openEditProfile },
    { label: "Payment Methods", icon: CreditCard, onClick: () => setShowPaymentMethods(true) },
    { label: "Purchase History", icon: History, to: "/notifications?tab=history" },
    {
      label: "Logout",
      icon: LogOut,
      onClick: () => {
        logout();
        resetProfile();
      },
    },
  ];

  const combinedBookings = useMemo(() => {
    const map = new Map<string, any>();

    // 1. Add DB bookings
    for (const b of dbBookings) {
      const cleanId = String(b.id || "").replace(/^#/, "");
      if (!cleanId) continue;
      map.set(cleanId, {
        id: cleanId,
        movieTitle: b.movieTitle || "Movie",
        poster: b.poster || "",
        cinema: b.cinema || "CineStar Luxury Cinema",
        date: b.date || "Today",
        time: b.time || "Showtime",
        seats: Array.isArray(b.seats) ? b.seats : [],
        ticketCount: b.ticketCount || (Array.isArray(b.seats) ? b.seats.length : 1),
        total: b.total || 0,
        status: b.status || "confirmed",
      });
    }

    // 2. Merge local bookingHistory
    for (const b of bookingHistory) {
      const cleanId = String(b.id || "").replace(/^#/, "");
      if (!cleanId) continue;
      const existing = map.get(cleanId);
      if (existing) {
        map.set(cleanId, {
          ...existing,
          poster: b.poster || existing.poster,
          cinema: b.cinema || existing.cinema,
        });
      } else {
        map.set(cleanId, {
          id: cleanId,
          movieTitle: b.movieTitle,
          poster: b.poster || "",
          cinema: b.cinema || "CineStar Luxury Cinema",
          date: b.date,
          time: b.time,
          seats: b.seats || [],
          ticketCount: b.ticketCount || (b.seats ? b.seats.length : 1),
          total: b.total,
          status: "confirmed",
        });
      }
    }

    return Array.from(map.values());
  }, [dbBookings, bookingHistory]);

  const activeBookings = useMemo(() => {
    return combinedBookings.map((b) => {
      let resolvedPoster = b.poster;
      if (!resolvedPoster) {
        const match = allMovies.find(
          (m) => m.title.toLowerCase() === b.movieTitle.toLowerCase()
        );
        resolvedPoster = match?.poster || "https://picsum.photos/seed/poster/400/600";
      }

      return {
        id: b.id,
        title: b.movieTitle,
        poster: resolvedPoster,
        badge: (b.status || "CONFIRMED").toUpperCase(),
        badgeOutlined: b.status === "cancelled",
        date: b.date,
        time: b.time,
        cinema: b.cinema,
        seats: b.seats.length > 0 ? b.seats : ["—"],
      };
    });
  }, [combinedBookings, allMovies]);

  const totalBookings = combinedBookings.length;

  const activeTicketsCount = useMemo(() => {
    return combinedBookings
      .filter((b) => b.status !== "cancelled" && b.status !== "refunded")
      .reduce((sum, b) => sum + (b.seats?.length || b.ticketCount || 1), 0);
  }, [combinedBookings]);

  return (
    <div className="min-h-screen bg-cine-bg">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Not logged in banner */}
        {!isAuthenticated && (
          <div className="mb-8 rounded-xl border border-cine-border bg-cine-card p-6 text-center">
            <User size={40} className="mx-auto mb-3 text-cine-text" />
            <h2 className="text-lg font-bold text-cine-white">Sign in to access your profile</h2>
            <p className="mt-1 text-sm text-cine-text">
              Track your bookings, earn rewards, and manage your account.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => openLoginPopup()}
                className="rounded-lg bg-cine-red px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-cine-red/80"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="rounded-lg border border-cine-border bg-cine-card px-6 py-2.5 text-sm font-bold text-cine-white transition-colors hover:bg-cine-card-hover"
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        {isAuthenticated && (
          <>
            {/* Profile Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="h-24 w-24 rounded-xl border-2 border-cine-red object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-cine-red bg-cine-card">
                  <User size={40} className="text-cine-text" />
                </div>
              )}
              <span className={`absolute -bottom-2 left-2 rounded px-2 py-0.5 font-mono text-[10px] font-black tracking-widest ${roleBadgeStyle}`}>
                {roleBadgeText}
              </span>
            </div>
            <div>
              <h1 className="font-display text-3xl font-black tracking-tight text-cine-white">
                {displayName}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-cine-text">
                <span className="h-2 w-2 rounded-full bg-cine-red" />
                {user?.email}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 self-start md:ml-auto md:self-center">
            {isElevatedUser && (
              <a
                href="http://localhost:5173/admin"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-mono text-xs font-semibold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-500"
              >
                <Shield size={14} />
                <span>{userRole === "Staff" ? "STAFF PORTAL ↗" : "ADMIN DASHBOARD ↗"}</span>
              </a>
            )}
            <button
              onClick={openEditProfile}
              className="inline-flex items-center gap-2 rounded-lg border border-cine-border bg-cine-card px-4 py-2 font-mono text-xs font-semibold text-cine-red transition-colors hover:border-cine-red"
            >
              <Settings size={13} />
              EDIT PROFILE
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-cine-border bg-cine-card p-5">
            <p className="font-display text-3xl font-black text-cine-red">1,250</p>
            <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text">
              Loyalty Points
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-cine-card-hover">
              <div className="h-full w-[70%] rounded-full bg-cine-red" />
            </div>
            <p className="mt-2 text-xs text-cine-text">Next reward in 250 points</p>
          </div>
          <div className="rounded-xl border border-cine-border bg-cine-card p-5">
            <p className="font-display text-3xl font-black text-cine-white">
              {totalBookings}
            </p>
            <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text">
              Total Bookings
            </p>
          </div>
          <div className="rounded-xl border border-cine-border bg-cine-card p-5">
            <p className="font-display text-3xl font-black text-cine-white">{activeTicketsCount}</p>
            <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text">
              Active Tickets
            </p>
          </div>
        </div>

        {/* Two-Column Layout with Vertical Divider */}
        <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]">
          {/* Active Bookings */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2.5 text-base font-bold text-cine-white">
                <span className="h-4 w-1 rounded bg-cine-red" />
                Active Bookings
              </h2>
              <Link
                to="/notifications"
                className="text-xs font-semibold text-cine-red transition-opacity hover:opacity-80"
              >
                View All
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              {activeBookings.length > 0 ? (
                activeBookings.map((b) => <BookingCard key={b.id} {...b} />)
              ) : (
                <div className="rounded-xl border border-cine-border bg-cine-card p-6 text-center">
                  <Ticket size={28} className="mx-auto mb-2 text-cine-text" />
                  <p className="text-sm text-cine-text">No bookings yet</p>
                  <p className="mt-1 text-xs text-cine-text">Your ticket history will appear here.</p>
                </div>
              )}
            </div>
          </section>

          {/* Vertical Divider */}
          <div className="hidden w-px bg-gradient-to-b from-transparent via-cine-red/60 to-transparent md:block" />

          {/* Account */}
          <section>
            <h2 className="flex items-center gap-2.5 text-base font-bold text-cine-white">
              <span className="h-4 w-1 rounded bg-cine-red" />
              Account
            </h2>
            <div className="mt-5 rounded-xl border border-cine-border bg-cine-card">
              {accountRows.map((row, i) =>
                row.to ? (
                  <Link
                    key={row.label}
                    to={row.to}
                    className={`flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-medium transition-colors hover:bg-cine-card-hover ${
                      i > 0 ? "border-t border-cine-border" : ""
                    } ${row.label === "Logout" ? "text-cine-red" : "text-cine-white"}`}
                  >
                    <row.icon size={16} className={`shrink-0 ${row.label === "Logout" ? "text-cine-red" : "text-cine-red"}`} />
                    <span className="flex-1">{row.label}</span>
                    <ChevronRight size={16} className={`${row.label === "Logout" ? "text-cine-red" : "text-cine-text"}`} />
                  </Link>
                ) : (
                  <button
                    key={row.label}
                    onClick={row.onClick}
                    className={`flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-medium transition-colors hover:bg-cine-card-hover ${
                      i > 0 ? "border-t border-cine-border" : ""
                    } ${row.label === "Logout" ? "text-cine-red" : "text-cine-white"}`}
                  >
                    <row.icon size={16} className={`shrink-0 ${row.label === "Logout" ? "text-cine-red" : "text-cine-red"}`} />
                    <span className="flex-1">{row.label}</span>
                    <ChevronRight size={16} className={`${row.label === "Logout" ? "text-cine-red" : "text-cine-text"}`} />
                  </button>
                )
              )}
            </div>

            <div className="mt-5 rounded-xl bg-gradient-to-br from-[#3a0d12] via-[#5c0f1c] to-[#7a1220] p-6">
              <h3 className="text-lg font-black text-cine-white">Upgrade to Gold</h3>
              <p className="mt-2 text-xs leading-relaxed text-cine-text-light">
                Unlimited popcorn, priority booking, and 2x points on every ticket.
              </p>
              <button className="mt-5 w-full rounded-full bg-white py-3 text-sm font-black uppercase tracking-wide text-[#1a1a1a] transition-colors hover:bg-cine-text-light">
                Upgrade Now
              </button>
            </div>
          </section>
        </div>
          </>
        )}
      </main>

      {showEditProfile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowEditProfile(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-cine-border bg-cine-card p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEditProfile(false)}
              aria-label="Close"
              className="absolute right-4 top-4 text-cine-text transition-colors hover:text-cine-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-center text-lg font-black text-cine-white">
              Edit Profile
            </h3>
            <p className="mt-1 text-center text-xs text-cine-text">
              Update your personal details
            </p>

            <div className="mt-5 flex items-center gap-4">
              {draft.avatar ? (
                <img
                  src={draft.avatar}
                  alt="Profile preview"
                  className="h-16 w-16 shrink-0 rounded-xl border-2 border-cine-red object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-cine-red bg-cine-card">
                  <User size={28} className="text-cine-text" />
                </div>
              )}
              <label className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-cine-border bg-cine-bg px-4 py-4 text-center transition-colors hover:border-cine-red/60">
                <Upload size={18} className="text-cine-red" />
                <span className="text-xs font-semibold text-cine-white">
                  Upload from Drive
                </span>
                <span className="text-[10px] text-cine-text">JPG or PNG</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text">
                  Full Name
                </label>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="w-full rounded-lg border border-cine-border bg-cine-bg px-3 py-2.5 text-sm text-cine-white outline-none transition-colors focus:border-cine-red"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text">
                  Email
                </label>
                <input
                  type="email"
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                  className="w-full rounded-lg border border-cine-border bg-cine-bg px-3 py-2.5 text-sm text-cine-white outline-none transition-colors focus:border-cine-red"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text">
                  Phone
                </label>
                <input
                  value={draft.phone}
                  onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                  className="w-full rounded-lg border border-cine-border bg-cine-bg px-3 py-2.5 text-sm text-cine-white outline-none transition-colors focus:border-cine-red"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text">
                  City
                </label>
                <input
                  value={draft.city}
                  onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                  className="w-full rounded-lg border border-cine-border bg-cine-bg px-3 py-2.5 text-sm text-cine-white outline-none transition-colors focus:border-cine-red"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text">
                  Bio
                </label>
                <textarea
                  value={draft.bio}
                  onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-cine-border bg-cine-bg px-3 py-2.5 text-sm text-cine-white outline-none transition-colors focus:border-cine-red"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowEditProfile(false)}
                className="flex-1 rounded-lg border border-cine-border py-3 text-sm font-bold text-cine-text transition-colors hover:text-cine-white"
              >
                Cancel
              </button>
              <button
                onClick={saveEditProfile}
                className="flex-1 rounded-lg bg-cine-red py-3 text-sm font-bold text-white transition-colors hover:bg-cine-red/80"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentMethods && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowPaymentMethods(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-cine-border bg-cine-card p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPaymentMethods(false)}
              aria-label="Close"
              className="absolute right-4 top-4 text-cine-text transition-colors hover:text-cine-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-center text-lg font-black text-cine-white">
              Payment Methods
            </h3>
            <p className="mt-1 text-center text-xs text-cine-text">
              Choose how you pay for tickets
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {PAYMENT_METHODS.map((method) => (
                <div
                  key={method.id}
                  className="flex flex-col items-center gap-3 rounded-xl border border-cine-border bg-cine-card-hover p-4"
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-lg text-[10px] font-black ${method.logoClass}`}
                  >
                    {method.logoText}
                  </span>
                  <span className="text-[11px] font-semibold text-cine-white">
                    {method.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
