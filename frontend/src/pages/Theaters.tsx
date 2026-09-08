import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

export interface DynamicTheater extends Theater {
  hallCount?: number;
  capacity?: number;
  status?: string;
  formats?: string[];
}

export default function Theaters() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [venuesList, setVenuesList] = useState<DynamicTheater[]>(theaters);

  const loadVenues = () => {
    fetch("http://localhost:5000/api/theaters/venues")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: DynamicTheater[] = data.map((v: any, index: number) => {
            const parts = (v.address || "").split(",").map((s: string) => s.trim()).filter(Boolean);
            const city = parts.length > 1 ? parts[parts.length - 1] : (v.address || "Phnom Penh");

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

            return {
              id: v.id,
              name: v.name,
              address: v.address || "Phnom Penh",
              city,
              distance: `${(1.2 + index * 1.5).toFixed(1)} mi`,
              distanceValue: 1.2 + index * 1.5,
              image: v.imageUrl || "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&h=300&fit=crop",
              tags: venueTags,
              x: 25 + ((index * 23) % 55),
              y: 25 + ((index * 29) % 55),
              hallCount: v.hallCount || (Array.isArray(v.halls) ? v.halls.length : 0),
              capacity:
                v.capacity ||
                (Array.isArray(v.halls)
                  ? v.halls.reduce((sum: number, h: any) => sum + (h.capacity || 0), 0)
                  : 0),
              status: v.status || "Active",
              formats: venueFormats,
            };
          });
          setVenuesList(mapped);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadVenues();

    // Live polling every 3 seconds to immediately sync new/edited theaters from Admin
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
          : `${t.name} ${t.city} ${t.address} ${(t.formats || []).join(" ")}`
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
                placeholder="Search by city, name, or zip code..."
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

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6">
            <div className="flex flex-col gap-5 max-h-[720px] overflow-y-auto pr-1">
              {filtered.map((t) => (
                <TheaterCard
                  key={t.id}
                  theater={t}
                  active={selected?.id === t.id}
                  onSelect={() => setSelectedId(t.id)}
                  onBook={() => navigate(`/movies?cinema=${encodeURIComponent(t.name)}`)}
                />
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-16 px-4 rounded-xl border border-cine-border bg-cine-card">
                  <Film className="mx-auto h-8 w-8 text-cine-text mb-3 opacity-50" />
                  <p className="text-cine-white font-bold text-base font-display">No theaters found</p>
                  <p className="text-cine-text text-xs font-body mt-1">
                    No locations match "{query}". Try clearing filters or searching another keyword.
                  </p>
                </div>
              )}
            </div>

            <div className="relative rounded-xl overflow-hidden border border-cine-border min-h-[500px] lg:sticky lg:top-6 bg-[#eceae6]">
              <MapRoads />

              {filtered.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  style={{ left: `${t.x}%`, top: `${t.y}%` }}
                  title={`${t.name} (${t.address})`}
                  className="absolute -translate-x-1/2 -translate-y-full group"
                >
                  <MapPin
                    className={`h-8 w-8 drop-shadow-lg transition ${
                      selected?.id === t.id
                        ? "text-cine-red fill-cine-red/30 scale-125 z-10"
                        : "text-cine-red/70 fill-cine-red/10 group-hover:scale-110"
                    }`}
                  />
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap border border-white/20 pointer-events-none shadow-lg z-20">
                    {t.name}
                  </span>
                </button>
              ))}

              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  type="button"
                  title="Zoom in"
                  className="h-9 w-9 rounded-md bg-cine-card text-cine-white flex items-center justify-center border border-cine-border hover:border-cine-red transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Zoom out"
                  className="h-9 w-9 rounded-md bg-cine-card text-cine-white flex items-center justify-center border border-cine-border hover:border-cine-red transition"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Center map"
                  className="h-9 w-9 rounded-md bg-cine-card text-cine-white flex items-center justify-center border border-cine-border hover:border-cine-red transition"
                >
                  <LocateFixed className="h-4 w-4" />
                </button>
              </div>

              {selected && (
                <div className="absolute bottom-4 left-4 right-4 bg-cine-card/95 backdrop-blur rounded-xl border border-cine-border p-4 flex items-center justify-between gap-4 shadow-2xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-cine-red flex items-center justify-center shrink-0 shadow-lg shadow-cine-red/20">
                      <Navigation className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-cine-white font-display truncate">
                          {selected.name}
                        </p>
                        {selected.hallCount && (
                          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-white/10 text-cine-text-light">
                            {selected.hallCount} Halls
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-cine-text font-body truncate mt-0.5">
                        {selected.address || selected.city} • {selected.distance}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/movies?cinema=${encodeURIComponent(selected.name)}`)}
                    className="text-xs font-bold uppercase tracking-wide font-display bg-cine-red hover:bg-cine-red/80 text-white px-4 py-2.5 rounded-lg transition shadow-md shadow-cine-red/20 shrink-0"
                  >
                    View Movies
                  </button>
                </div>
              )}
            </div>
          </div>

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
  onBook,
}: {
  theater: DynamicTheater;
  active: boolean;
  onSelect: () => void;
  onBook?: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`group text-left rounded-xl overflow-hidden border cursor-pointer transition-all ${
        active
          ? "border-cine-red/70 shadow-[0_0_18px_rgba(228,22,42,0.25)] ring-1 ring-cine-red/40"
          : "border-cine-border hover:border-cine-text/30"
      }`}
    >
      <div className="relative h-44 w-full bg-black/40 overflow-hidden">
        <img
          src={theater.image}
          alt={theater.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&h=300&fit=crop";
          }}
        />
        <span className="absolute top-3 right-3 bg-cine-red text-white text-[11px] font-bold uppercase tracking-wide font-display px-2.5 py-0.5 rounded-md shadow-md">
          {theater.distance}
        </span>
        {theater.hallCount !== undefined && theater.hallCount > 0 && (
          <span className="absolute bottom-3 left-3 bg-black/80 backdrop-blur text-cine-white text-[10px] font-mono px-2 py-0.5 rounded border border-white/10">
            {theater.hallCount} {theater.hallCount === 1 ? "Screen" : "Screens"}
            {theater.capacity ? ` • ${theater.capacity.toLocaleString()} Seats` : ""}
          </span>
        )}
      </div>
      <div className="bg-cine-card p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-cine-white text-lg font-display group-hover:text-cine-red transition-colors">
            {theater.name}
          </h3>
          {onBook && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBook();
              }}
              className="px-3 py-1 rounded bg-cine-red hover:bg-cine-red/80 text-white text-xs font-bold font-display uppercase tracking-wide transition shrink-0 shadow-sm"
            >
              Movies
            </button>
          )}
        </div>
        <p className="text-xs text-cine-text font-body line-clamp-1 flex items-center gap-1">
          <MapPin size={13} className="text-cine-red shrink-0" />
          <span>{theater.address || theater.city}</span>
        </p>

        {theater.tags && theater.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {theater.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase bg-white/5 border border-white/10 text-cine-text-light"
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