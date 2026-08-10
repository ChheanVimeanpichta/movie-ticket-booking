import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { MapPin, ChevronDown, Search, Bell, Menu, X } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import { useProfile } from "@/context/ProfileContext";
import { nowShowingGrid } from "@/data/movies";

const NAV_LINKS = [
  
  { label: "Home", to: "/" },
  { label: "Movies", to: "/movies" },
  { label: "Theaters", to: "/theaters" },
  { label: "Offers", to: "/offers" },
  { label: "About Us", to: "/about" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { unreadCount, latestAlert, clearLatestAlert } = useNotifications();
  const { profile } = useProfile();

  const results = nowShowingGrid
    .filter(
      (movie) =>
        movie.title.toLowerCase().includes(query.trim().toLowerCase()) ||
        (movie.genre &&
          movie.genre
            .toLowerCase()
            .includes(query.trim().toLowerCase()))
    )
    .slice(0, 6);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchSubmit() {
    if (results.length > 0) {
      navigate(`/select-screen/${results[0].id}`);
      setSearchOpen(false);
      setQuery("");
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-cine-border bg-cine-bg/95 backdrop-blur-md">
      {/* Toast Alert for New Notification */}
      {latestAlert && (
        <div className="fixed top-20 right-4 z-50 flex max-w-sm items-center gap-3 rounded-2xl border border-[#f95738]/50 bg-[#161619] p-4 text-white shadow-2xl shadow-orange-950/40">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f95738]/20 text-[#f95738]">
            <Bell size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#f95738]">New Notification</p>
            <p className="text-xs font-bold text-white truncate">{latestAlert.title}</p>
            <p className="text-[11px] text-zinc-400 line-clamp-1">{latestAlert.description}</p>
          </div>
          <button
            onClick={() => {
              clearLatestAlert();
              navigate("/notifications");
            }}
            className="rounded-lg bg-[#f95738] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-orange-600 transition-colors"
          >
            View
          </button>
          <button
            onClick={clearLatestAlert}
            className="text-zinc-500 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-1.5" aria-label="CineStar home">
          <span className="text-2xl font-black tracking-tight text-cine-red">
            CINE<span className="text-cine-white">STAR</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative font-body text-sm font-medium tracking-wide transition-colors ${
                  isActive
                    ? "text-cine-white"
                    : "text-cine-text hover:text-cine-text-light"
                }`
              }
            >
              {({ isActive }) => (
                <span>
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-[23px] left-1/2 h-0.5 w-5 -translate-x-1/2 bg-cine-red" />
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <div ref={searchRef} className="relative">
            <button
              type="button"
              aria-label="Search movies"
              onClick={() => setSearchOpen((o) => !o)}
              className="text-cine-text transition-colors hover:text-cine-white"
            >
              <Search size={18} strokeWidth={1.75} />
            </button>

            {searchOpen && (
              <div className="absolute right-0 top-full z-50 mt-3 w-80">
                <div className="flex items-center gap-2 rounded-xl border border-cine-border bg-cine-card p-2 shadow-2xl shadow-black/50">
                  <Search size={16} className="shrink-0 text-cine-text" />
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearchSubmit();
                      if (e.key === "Escape") {
                        setSearchOpen(false);
                        setQuery("");
                      }
                    }}
                    placeholder="Search movies..."
                    className="w-full bg-transparent text-sm text-cine-white placeholder:text-cine-text outline-none"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="text-cine-text hover:text-cine-white"
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {query.trim() && (
                  <div className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-cine-border bg-cine-card shadow-2xl shadow-black/50">
                    {results.length > 0 ? (
                      results.map((movie) => (
                        <button
                          key={movie.id}
                          type="button"
                          onClick={() => {
                            navigate(`/select-screen/${movie.id}`);
                            setSearchOpen(false);
                            setQuery("");
                          }}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-cine-border/50"
                        >
                          <img
                            src={movie.poster}
                            alt=""
                            className="h-10 w-8 shrink-0 rounded object-cover"
                          />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-cine-white">
                              {movie.title}
                            </span>
                            {movie.genre && (
                              <span className="block truncate text-xs text-cine-text">
                                {movie.genre}
                              </span>
                            )}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="px-4 py-4 text-center text-sm text-cine-text">
                        No movies found for &quot;{query}&quot;
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <Link
            to="/notifications"
            aria-label="Notifications"
            className="relative flex items-center justify-center text-cine-text transition-colors hover:text-cine-white"
          >
            <Bell size={18} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#f95738] text-[9px] font-bold text-white shadow-[0_0_8px_rgba(249,87,56,0.8)] animate-pulse">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link
            to="/profile"
            aria-label="Profile"
            className="h-8 w-8 overflow-hidden rounded-full border-2 border-cine-border transition-colors hover:border-cine-red"
          >
            <img
              src={profile.avatar}
              alt="User avatar"
              className="h-full w-full object-cover"
            />
          </Link>
        </div>

        <button
          type="button"
          className="text-cine-white md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <nav
          className="flex flex-col gap-1 border-t border-cine-border bg-cine-bg px-4 pb-4 pt-2 md:hidden"
          aria-label="Primary mobile"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `rounded px-2 py-3 font-body text-sm font-medium ${
                  isActive ? "text-cine-red" : "text-cine-text hover:text-cine-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/notifications"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between rounded px-2 py-3 font-body text-sm font-medium ${
                isActive ? "text-cine-red" : "text-cine-text hover:text-cine-white"
              }`
            }
          >
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#f95738] px-2 py-0.5 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </NavLink>
          <div className="mt-2 flex items-center gap-3 border-t border-cine-border pt-3">
            <button className="flex items-center gap-1.5 rounded-full border border-cine-border px-3 py-1.5 text-xs font-medium text-cine-text-light">
              <MapPin size={14} className="text-cine-red" />
              LONDON
              <ChevronDown size={12} />
            </button>
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className="ml-auto h-8 w-8 overflow-hidden rounded-full border-2 border-cine-border transition-colors hover:border-cine-red"
            >
              <img
                src={profile.avatar}
                alt="User avatar"
                className="h-full w-full object-cover"
              />
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
