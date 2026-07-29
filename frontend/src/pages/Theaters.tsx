import { useMemo, useState } from "react";
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
} from "lucide-react";

const iconMap = { Clapperboard, Vibrate, Wine };

export default function Theaters() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return theaters
      .filter((t) =>
        activeFilter === "all" ? true : t.tags.includes(activeFilter as any)
      )
      .filter((t) =>
        query.trim() === ""
          ? true
          : `${t.name} ${t.city} ${t.address}`
              .toLowerCase()
              .includes(query.toLowerCase())
      )
      .sort((a, b) => a.distanceValue - b.distanceValue);
  }, [query, activeFilter]);

  const closest = filtered[0];
  const selected = theaters.find((t) => t.id === selectedId) ?? closest;

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
                />
              ))}
              {filtered.length === 0 && (
                <p className="text-cine-text text-sm font-body py-10 text-center">
                  No theaters match your search. Try another city or filter.
                </p>
              )}
            </div>

            <div className="relative rounded-xl overflow-hidden border border-cine-border min-h-[500px] lg:sticky lg:top-6 bg-[#eceae6]">
              <MapRoads />

              {filtered.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  style={{ left: `${t.x}%`, top: `${t.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-full group"
                >
                  <MapPin
                    className={`h-8 w-8 drop-shadow-lg transition ${
                      selected?.id === t.id
                        ? "text-cine-red fill-cine-red/30 scale-110"
                        : "text-cine-red/70 fill-cine-red/10"
                    }`}
                  />
                </button>
              ))}

              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button className="h-9 w-9 rounded-md bg-cine-card text-cine-white flex items-center justify-center border border-cine-border">
                  <Plus className="h-4 w-4" />
                </button>
                <button className="h-9 w-9 rounded-md bg-cine-card text-cine-white flex items-center justify-center border border-cine-border">
                  <Minus className="h-4 w-4" />
                </button>
                <button className="h-9 w-9 rounded-md bg-cine-card text-cine-white flex items-center justify-center border border-cine-border">
                  <LocateFixed className="h-4 w-4" />
                </button>
              </div>

              {closest && (
                <div className="absolute bottom-4 left-4 right-4 bg-cine-card/95 backdrop-blur rounded-lg border border-cine-border p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-cine-red flex items-center justify-center shrink-0">
                      <Navigation className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-cine-white font-display">
                        {closest.name}
                      </p>
                      <p className="text-xs text-cine-text font-body">
                        Closest to you • 12 min drive
                      </p>
                    </div>
                  </div>
                  <button className="text-xs font-bold uppercase tracking-wide font-display text-cine-red hover:text-cine-white transition shrink-0">
                    Get Directions
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
}: {
  theater: Theater;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`group text-left rounded-xl overflow-hidden border transition ${
        active
          ? "border-cine-red/70 shadow-[0_0_16px_rgba(228,22,42,0.2)]"
          : "border-cine-border hover:border-cine-text/30"
      }`}
    >
      <div className="relative h-40 w-full">
        <img
          src={theater.image}
          alt={theater.name}
          className="h-full w-full object-cover"
        />
        <span className="absolute top-3 right-3 bg-cine-red text-white text-[11px] font-bold uppercase tracking-wide font-display px-2 py-0.5 rounded-md">
          {theater.distance}
        </span>
      </div>
      <div className="bg-cine-card p-4">
        <h3 className="font-bold text-cine-white text-lg font-display">
          {theater.name}
        </h3>
        <p className="text-sm text-cine-text font-body mt-0.5">
          {theater.address}, {theater.city}
        </p>
      </div>
    </button>
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