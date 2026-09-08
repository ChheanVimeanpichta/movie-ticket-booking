import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  theaters,
  theaterFilters,
  amenities,
  type Theater,
} from "@/data/theaters";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Plus,
  Minus,
  LocateFixed,
  Navigation,
  Clapperboard,
  Vibrate,
  Wine,
  Film,
} from "lucide-react";

const iconMap = { Clapperboard, Vibrate, Wine };

export interface VenueHall {
  id: string;
  venueId?: string;
  name: string;
  screenType: string;
  soundSystem?: string;
  capacity?: number;
  status?: string;
}

export interface DetailedTheater extends Theater {
  formats?: string[];
  hallCount?: number;
  capacity?: number;
  halls?: VenueHall[];
  status?: string;
}

const DEFAULT_COORDS: Record<string, { x: number; y: number }> = {
  "v-001": { x: 38, y: 34 },
  "v-002": { x: 70, y: 38 },
  "v-003": { x: 28, y: 64 },
  "v-1788767915971": { x: 62, y: 66 },
};

const DEFAULT_DETAILED_THEATERS: DetailedTheater[] = theaters.map((t, idx) => ({
  ...t,
  hallCount: idx === 0 ? 4 : idx === 1 ? 2 : 3,
  capacity: idx === 0 ? 560 : idx === 1 ? 240 : 340,
  formats: idx === 0 ? ["STANDARD", "IMAX", "4DX"] : idx === 1 ? ["DOLBY"] : ["IMAX", "4DX"],
  halls:
    idx === 0
      ? [
          { id: "h1", name: "Hall 1 - Standard", screenType: "STANDARD", capacity: 120 },
          { id: "h2", name: "Hall 2 - Standard", screenType: "STANDARD", capacity: 140 },
          { id: "h3", name: "Hall 3 - IMAX", screenType: "IMAX", capacity: 180 },
          { id: "h4", name: "Hall 4 - 4DX", screenType: "4DX", capacity: 120 },
        ]
      : idx === 1
      ? [
          { id: "h5", name: "Hall 5 - VIP Lounge", screenType: "DOLBY", capacity: 100 },
          { id: "h6", name: "Hall 6 - Dolby Atmos", screenType: "DOLBY", capacity: 140 },
        ]
      : [
          { id: "h7", name: "Hall 7 - ScreenX", screenType: "STANDARD", capacity: 120 },
          { id: "h8", name: "Hall 8 - Laser 2D", screenType: "2D", capacity: 100 },
          { id: "h9", name: "Hall 9 - IMAX", screenType: "IMAX", capacity: 120 },
        ],
  status: "Active",
}));

export default function Theaters() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [venuesList, setVenuesList] = useState<DetailedTheater[]>(DEFAULT_DETAILED_THEATERS);
  const [mapZoom, setMapZoom] = useState(1);

  const loadVenues = () => {
    fetch("http://localhost:5000/api/theaters/venues")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: DetailedTheater[] = data.map((v: any, index: number) => {
            const parts = (v.address || "").split(",").map((s: string) => s.trim()).filter(Boolean);
            const city = parts.length > 1 ? parts[parts.length - 1] : "Phnom Penh";
            const address = parts.length > 1 ? parts.slice(0, -1).join(", ") : (v.address || "Phnom Penh");

            const venueFormats: string[] = Array.isArray(v.formats) && v.formats.length > 0
              ? v.formats
              : Array.isArray(v.halls)
              ? (Array.from(new Set(v.halls.map((h: any) => h.screenType))).filter(Boolean) as string[])
              : [];

            const venueTags: string[] = Array.isArray(v.tags) && v.tags.length > 0
              ? v.tags
              : Array.from(
                  new Set([
                    ...venueFormats,
                    ...(Array.isArray(v.halls) && v.halls.some((h: any) => h.soundSystem === "Dolby Atmos")
                      ? ["DOLBY_ATMOS"]
                      : []),
                    "GOLD_CLASS",
                  ])
                );

            const coord = DEFAULT_COORDS[v.id] || {
              x: 25 + ((index * 27) % 55),
              y: 25 + ((index * 31) % 55),
            };

            const hallCount =
              typeof v.hallCount === "number"
                ? v.hallCount
                : Array.isArray(v.halls)
                ? v.halls.length
                : 0;

            const capacity =
              typeof v.capacity === "number"
                ? v.capacity
                : Array.isArray(v.halls)
                ? v.halls.reduce((acc: number, h: any) => acc + (h.capacity || 0), 0)
                : 0;

            return {
              id: v.id,
              name: v.name,
              address,
              city,
              distance: `${(1.8 + index * 2.1).toFixed(1)} mi`,
              distanceValue: 1.8 + index * 2.1,
              image: v.imageUrl || "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&h=300&fit=crop",
              tags: venueTags,
              formats: venueFormats,
              hallCount,
              capacity,
              halls: Array.isArray(v.halls) ? v.halls : [],
              status: v.status || "Active",
              x: coord.x,
              y: coord.y,
            };
          });
          setVenuesList(mapped);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadVenues();

    // Poll every 3 seconds so data dynamically tracks changes made in Admin
    const interval = setInterval(loadVenues, 3000);
    const handleFocus = () => loadVenues();
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const filtered = useMemo(() => {
    return venuesList
      .filter((t) => {
        if (activeFilter === "all") return true;
        const normFilter = activeFilter.toUpperCase();
        return t.tags.some(
          (tag) =>
            tag.toUpperCase() === normFilter ||
            (normFilter === "DOLBY_ATMOS" && tag.toUpperCase().includes("DOLBY"))
        );
      })
      .filter((t) =>
        query.trim() === ""
          ? true
          : `${t.name} ${t.city} ${t.address} ${(t.halls || []).map((h) => h.name).join(" ")}`
              .toLowerCase()
              .includes(query.toLowerCase())
      )
      .sort((a, b) => a.distanceValue - b.distanceValue);
  }, [venuesList, query, activeFilter]);

  const closest = filtered[0] || venuesList[0];
  const selected = venuesList.find((t) => t.id === selectedId) ?? closest;

  return (
    <>
      <Header />

      <main className="bg-cine-bg min-h-screen text-cine-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-20">
          <p className="text-[10px] tracking-[0.2em] font-semibold text-cine-text font-body">
            THEATERS
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black text-cine-white font-display">
            Select a location to experience cinema in its most premium form.
          </h1>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-cine-text" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by city, theater name, or hall..."
                className="w-full bg-cine-card border border-cine-border rounded-lg py-3 pl-11 pr-4 text-sm font-body text-cine-white placeholder:text-cine-text focus:outline-none focus:ring-1 focus:ring-cine-red/60"
              />
            </div>
            <button className="flex items-center justify-center gap-2 rounded-lg border border-cine-border bg-cine-card px-5 py-3 text-xs font-bold uppercase tracking-wide font-display text-cine-text-light hover:border-cine-text/30 transition">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {theaterFilters.map((f) => {
              const active = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide font-display border transition ${
                    active
                      ? "bg-cine-red border-cine-red text-white"
                      : "border-cine-border text-cine-text hover:text-cine-white hover:border-cine-text/30"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.05fr_1.15fr] gap-6">
            {/* Left Column: Theater Cards with full Hall details */}
            <div className="flex flex-col gap-5 max-h-[760px] overflow-y-auto pr-1">
              {filtered.map((t) => (
                <TheaterCard
                  key={t.id}
                  theater={t}
                  active={selected?.id === t.id}
                  onSelect={() => setSelectedId(t.id)}
                />
              ))}
              {filtered.length === 0 && (
                <p className="text-cine-text text-sm font-body py-10 text-center">
                  No theaters match your search. Try another query or filter.
                </p>
              )}
            </div>

            {/* Right Column: Interactive Map with Theater Name & Hall Badges */}
            <div className="relative rounded-xl overflow-hidden border border-cine-border min-h-[520px] lg:sticky lg:top-6 bg-[#eceae6]">
              <div
                className="absolute inset-0 transition-transform duration-300 origin-center"
                style={{ transform: `scale(${mapZoom})` }}
              >
                <MapRoads />

                {filtered.map((t) => {
                  const isSelected = selected?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      style={{ left: `${t.x}%`, top: `${t.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center group cursor-pointer z-10 transition-transform duration-200"
                      onClick={() => setSelectedId(t.id)}
                    >
                      {/* Name & Hall Badge visible at a glance */}
                      <div
                        className={`mb-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md shadow-lg flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 select-none ${
                          isSelected
                            ? "bg-[#141416] border-2 border-cine-red text-white scale-105 shadow-cine-red/30 ring-2 ring-cine-red/30 z-30"
                            : "bg-[#141416]/90 border border-cine-border/80 text-cine-white hover:border-cine-red/60 group-hover:scale-105"
                        }`}
                      >
                        <span className="text-xs font-bold font-display tracking-tight text-white">
                          {t.name}
                        </span>
                        {t.hallCount !== undefined && t.hallCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cine-red text-white shadow-sm">
                            {t.hallCount} {t.hallCount === 1 ? "Hall" : "Halls"}
                          </span>
                        )}
                      </div>

                      {/* Map Pin Icon */}
                      <div className="relative flex items-center justify-center">
                        <MapPin
                          className={`h-8 w-8 drop-shadow-xl transition-all duration-200 ${
                            isSelected
                              ? "text-cine-red fill-cine-red scale-110 drop-shadow-[0_0_10px_rgba(228,22,42,0.8)]"
                              : "text-cine-red fill-cine-red/70 group-hover:scale-110"
                          }`}
                        />
                        {isSelected && (
                          <span className="absolute -bottom-1 h-3 w-3 rounded-full bg-cine-red animate-ping opacity-75" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Map Zoom Controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                <button
                  type="button"
                  title="Zoom in"
                  onClick={() => setMapZoom((z) => Math.min(1.5, z + 0.15))}
                  className="h-9 w-9 rounded-md bg-cine-card text-cine-white flex items-center justify-center border border-cine-border hover:border-cine-red transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Zoom out"
                  onClick={() => setMapZoom((z) => Math.max(0.85, z - 0.15))}
                  className="h-9 w-9 rounded-md bg-cine-card text-cine-white flex items-center justify-center border border-cine-border hover:border-cine-red transition"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Reset view"
                  onClick={() => setMapZoom(1)}
                  className="h-9 w-9 rounded-md bg-cine-card text-cine-white flex items-center justify-center border border-cine-border hover:border-cine-red transition"
                >
                  <LocateFixed className="h-4 w-4" />
                </button>
              </div>

              {/* Bottom Selected Theater Preview Bar */}
              {selected && (
                <div className="absolute bottom-4 left-4 right-4 bg-cine-card/95 backdrop-blur-md rounded-xl border border-cine-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl z-20">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-cine-red flex items-center justify-center shrink-0 shadow-lg shadow-cine-red/25">
                      <Navigation className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-cine-white font-display truncate">
                          {selected.name}
                        </p>
                        {selected.hallCount !== undefined && selected.hallCount > 0 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cine-red/20 text-cine-red border border-cine-red/30">
                            {selected.hallCount} {selected.hallCount === 1 ? "Hall" : "Halls"}
                          </span>
                        )}
                        {selected.capacity ? (
                          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-cine-text-light">
                            {selected.capacity.toLocaleString()} Seats
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-cine-text font-body truncate mt-0.5">
                        {selected.address}, {selected.city} • {selected.distance}
                      </p>
                      {selected.halls && selected.halls.length > 0 && (
                        <p className="text-[11px] text-cine-text-light font-body truncate mt-1">
                          <span className="text-cine-red font-semibold">Screens:</span>{" "}
                          {selected.halls.map((h) => `${h.name} (${h.screenType})`).join(" • ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${selected.name} ${selected.address} ${selected.city}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold uppercase tracking-wide font-display text-cine-text hover:text-cine-white px-3.5 py-2.5 rounded-lg border border-cine-border hover:border-cine-text/40 transition flex items-center gap-1.5"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      Get Directions
                    </a>
                    <Link
                      to={`/movies?cinema=${encodeURIComponent(selected.name)}`}
                      className="text-xs font-bold uppercase tracking-wide font-display bg-cine-red hover:bg-cine-red/90 text-white px-4 py-2.5 rounded-lg shadow-md shadow-cine-red/25 transition flex items-center gap-1.5"
                    >
                      View Movies
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* World-Class Amenities Section */}
          <section className="mt-16">
            <p className="text-[10px] tracking-[0.2em] font-semibold text-cine-red font-body uppercase mb-6">
              World-Class Amenities
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {amenities.map((a) => {
                const Icon = iconMap[a.icon as keyof typeof iconMap];
                return (
                  <div
                    key={a.title}
                    className="rounded-xl border border-cine-border bg-cine-card p-6"
                  >
                    <Icon className="h-5 w-5 text-cine-red mb-4" />
                    <h3 className="font-bold text-cine-white text-lg mb-2 font-display">
                      {a.title}
                    </h3>
                    <p className="text-sm text-cine-text font-body leading-relaxed">
                      {a.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

function TheaterCard({
  theater,
  active,
  onSelect,
}: {
  theater: DetailedTheater;
  active: boolean;
  onSelect: () => void;
}) {
  const halls = theater.halls || [];
  const hallCount = theater.hallCount ?? halls.length;

  return (
    <div
      onClick={onSelect}
      className={`group text-left rounded-xl overflow-hidden border cursor-pointer transition-all duration-200 ${
        active
          ? "border-cine-red/80 bg-cine-card shadow-[0_0_20px_rgba(228,22,42,0.2)] ring-1 ring-cine-red/40"
          : "border-cine-border bg-cine-card hover:border-cine-text/40 hover:bg-cine-card-hover"
      }`}
    >
      {/* Theater Image */}
      <div className="relative h-44 w-full overflow-hidden bg-black/40">
        <img
          src={theater.image}
          alt={theater.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&h=300&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top-Right Distance Badge */}
        <span className="absolute top-3 right-3 bg-cine-red text-white text-[11px] font-bold uppercase tracking-wide font-display px-2.5 py-0.5 rounded-md shadow-md">
          {theater.distance}
        </span>

        {/* Top-Left Status Badge */}
        <span className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow">
          {theater.status === "Maintenance" ? "Maintenance" : "Open"}
        </span>

        {/* Bottom Image Badges: Halls & Seats (visible when not hovered) */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 flex-wrap">
          <span className="bg-black/85 backdrop-blur-md text-cine-white text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-white/15 flex items-center gap-1">
            <Film className="h-3 w-3 text-cine-red" />
            {hallCount} {hallCount === 1 ? "Screen" : "Screens"}
          </span>
          {theater.capacity ? (
            <span className="bg-black/85 backdrop-blur-md text-cine-text-light text-[10px] font-mono px-2 py-0.5 rounded border border-white/15">
              {theater.capacity.toLocaleString()} Seats
            </span>
          ) : null}
        </div>

        {/* Hover Overlay matching MovieCard flow */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-cine-pink">
              Location
            </p>
            <span className="text-[10px] font-mono font-bold text-white bg-cine-red/90 px-2 py-0.5 rounded shadow">
              {theater.distance}
            </span>
          </div>

          <div>
            <p className="text-sm font-bold leading-tight text-white font-display">
              {theater.name}
            </p>
            <p className="mt-1 text-xs text-cine-text-light flex items-start gap-1.5 font-body">
              <MapPin size={13} className="text-cine-red shrink-0 mt-0.5" />
              <span className="line-clamp-2">{theater.address}, {theater.city}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${theater.name} ${theater.address} ${theater.city}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded bg-cine-red px-3 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-cine-red/80 shadow-md shadow-cine-red/20 font-display"
            >
              <Navigation size={12} />
              Get Directions
            </a>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/40 text-white/80 transition-colors hover:border-white hover:text-white shrink-0"
              title="Locate on Map"
            >
              <MapPin size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 sm:p-5 space-y-3">
        {/* Name & Quick Action */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-cine-white text-lg font-display group-hover:text-cine-red transition-colors leading-tight">
              {theater.name}
            </h3>
            <p className="text-xs text-cine-text font-body mt-1 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-cine-red shrink-0" />
              <span>{theater.address}, {theater.city}</span>
            </p>
          </div>
          <Link
            to={`/movies?cinema=${encodeURIComponent(theater.name)}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-bold uppercase tracking-wide font-display bg-cine-red/15 hover:bg-cine-red text-cine-red hover:text-white px-3 py-1.5 rounded-lg border border-cine-red/30 transition shadow-sm shrink-0"
          >
            Movies
          </Link>
        </div>

        {/* Halls and Screens Breakdown */}
        {halls.length > 0 && (
          <div className="pt-3 border-t border-cine-border/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cine-text-light font-display flex items-center gap-1.5">
                <Film className="h-3.5 w-3.5 text-cine-red" />
                Halls & Experiences ({halls.length})
              </span>
              {theater.formats && theater.formats.length > 0 && (
                <span className="text-[10px] font-mono font-semibold text-cine-red">
                  {theater.formats.join(" • ")}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {halls.map((hall) => (
                <div
                  key={hall.id || hall.name}
                  className="px-2.5 py-1.5 rounded-lg bg-black/40 border border-cine-border/70 flex items-center justify-between text-[11px] font-body hover:border-cine-red/40 transition"
                >
                  <span className="font-medium text-cine-white truncate" title={hall.name}>
                    {hall.name}
                  </span>
                  <span className="shrink-0 ml-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cine-red/20 text-cine-red border border-cine-red/30 uppercase">
                    {hall.screenType || "2D"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {theater.tags && theater.tags.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-1.5">
            {theater.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-cine-text"
              >
                {tag.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MapRoads() {
  return (
    <svg
      viewBox="0 0 1000 800"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="1000" height="800" fill="#eceae6" />

      <rect x="60" y="60" width="220" height="180" rx="6" fill="#dfe6da" />
      <text x="90" y="145" fontSize="16" fill="#9aa793" fontFamily="Inter, sans-serif">
        Griffith Park
      </text>

      {Array.from({ length: 10 }).map((_, i) => (
        <line
          key={`h-${i}`}
          x1="0"
          y1={80 * (i + 1)}
          x2="1000"
          y2={80 * (i + 1)}
          stroke="#d7d3cc"
          strokeWidth="3"
        />
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={`v-${i}`}
          x1={80 * (i + 1)}
          y1="0"
          x2={80 * (i + 1)}
          y2="800"
          stroke="#d7d3cc"
          strokeWidth="3"
        />
      ))}

      <path d="M0,420 L1000,380" stroke="#ffffff" strokeWidth="10" />
      <path d="M180,0 L520,800" stroke="#ffffff" strokeWidth="10" />
      <path d="M0,620 L1000,560" stroke="#ffffff" strokeWidth="8" />

      <path
        d="M40,720 C260,560 420,520 620,340 C760,220 860,160 980,60"
        stroke="#ffffff"
        strokeWidth="16"
        fill="none"
      />
      <path
        d="M40,720 C260,560 420,520 620,340 C760,220 860,160 980,60"
        stroke="#e50914"
        strokeWidth="3"
        strokeDasharray="14 10"
        fill="none"
      />

      <text x="700" y="372" fontSize="15" fill="#8a8579" fontFamily="Inter, sans-serif">
        Sunset Blvd
      </text>
      <text
        x="330"
        y="300"
        fontSize="15"
        fill="#8a8579"
        fontFamily="Inter, sans-serif"
        transform="rotate(63 330 300)"
      >
        Vermont Ave
      </text>
      <text x="700" y="600" fontSize="15" fill="#8a8579" fontFamily="Inter, sans-serif">
        Olympic Blvd
      </text>

      <text
        x="500"
        y="470"
        fontSize="34"
        fontWeight="700"
        fill="#2b2b2b"
        fontFamily="Inter, sans-serif"
        textAnchor="middle"
      >
        Los Angeles
      </text>
    </svg>
  );
}