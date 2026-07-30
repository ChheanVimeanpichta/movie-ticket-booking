import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { MapPin, ChevronDown, Search, Bell, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Movies", to: "/" },
  { label: "Theaters", to: "/theaters" },
  { label: "Offers", to: "/offers" },
  { label: "About Us", to: "/about" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-cine-border bg-cine-bg/95 backdrop-blur-md">
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
          <button className="flex items-center gap-1.5 rounded-full border border-cine-border px-3 py-1.5 text-xs font-medium text-cine-text-light transition-colors hover:border-cine-text/30">
            <MapPin size={14} className="text-cine-red" />
            LONDON
            <ChevronDown size={12} />
          </button>
          <button
            type="button"
            aria-label="Search movies"
            className="text-cine-text transition-colors hover:text-cine-white"
          >
            <Search size={18} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            className="text-cine-text transition-colors hover:text-cine-white"
          >
            <Bell size={18} strokeWidth={1.75} />
          </button>
          <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-cine-border">
            <img
              src="https://picsum.photos/seed/avatar/64/64"
              alt="User avatar"
              className="h-full w-full object-cover"
            />
          </div>
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
          <div className="mt-2 flex items-center gap-3 border-t border-cine-border pt-3">
            <button className="flex items-center gap-1.5 rounded-full border border-cine-border px-3 py-1.5 text-xs font-medium text-cine-text-light">
              <MapPin size={14} className="text-cine-red" />
              LONDON
              <ChevronDown size={12} />
            </button>
            <div className="ml-auto h-8 w-8 overflow-hidden rounded-full border-2 border-cine-border">
              <img
                src="https://picsum.photos/seed/avatar/64/64"
                alt="User avatar"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
