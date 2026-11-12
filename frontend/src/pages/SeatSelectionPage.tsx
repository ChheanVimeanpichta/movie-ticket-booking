import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { MapPin, Clock, ArrowLeft, Users, Sparkles, Volume2, ShieldCheck, Info } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { nowShowing, nowShowingGrid } from "@/data/movies";
import type { Movie } from "@/data/movies";
import type { GridMovie } from "@/data/movies";
import { useMovies } from "@/context/MovieContext";
import { fetchAdminVenues } from "@/services/showtimeService";

type MovieData = (Movie | GridMovie) & { synopsis?: string; rating?: string; runtime?: string; landscape?: string };

export interface SeatGroup {
  group: string;
  seats: number[];
}

export interface SeatLayout {
  rows: string[];
  columns: SeatGroup[];
  totalSeats: number;
  formatType: "IMAX" | "4DX" | "DOLBY" | "STANDARD" | "2D";
  screenLabel: string;
  screenGradient: string;
  screenGlow: string;
  screenBorder: string;
  badgeBg: string;
  badgeText: string;
  specialRows?: Record<string, string>;
  specialFeatures?: string[];
  rowCurvature?: boolean;
}

const SEAT_PRICE = 15.00;
const SERVICE_FEE_RATE = 0.078;

// Capacity options matching Admin Suite: http://localhost:3000/admin/theaters Add Hall
export const ADMIN_CAPACITIES = [80, 100, 120, 150] as const;

export function generateSeatLayout(capacityInput?: number, formatInput?: string): SeatLayout {
  const fmt = (formatInput || "STANDARD").toUpperCase();
  let formatType: SeatLayout["formatType"] = "STANDARD";
  if (fmt.includes("IMAX")) formatType = "IMAX";
  else if (fmt.includes("4DX")) formatType = "4DX";
  else if (fmt.includes("DOLBY") || fmt.includes("ATMOS")) formatType = "DOLBY";
  else if (fmt.includes("2D")) formatType = "2D";

  let capacity = Number(capacityInput);
  if (!capacity || isNaN(capacity) || capacity <= 0) {
    if (formatType === "IMAX") capacity = 150;
    else if (formatType === "4DX") capacity = 80;
    else if (formatType === "DOLBY") capacity = 120;
    else capacity = 100;
  }

  // Snap to closest tier [80, 100, 120, 150]
  if (capacity <= 85) capacity = 80;
  else if (capacity <= 105) capacity = 100;
  else if (capacity <= 135) capacity = 120;
  else capacity = 150;

  let rows: string[] = [];
  let columns: SeatGroup[] = [];

  switch (capacity) {
    case 80:
      // 8 rows (A-H), 10 seats per row: Left 2, Center 6, Right 2
      rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
      columns = [
        { group: "left", seats: [1, 2] },
        { group: "center", seats: [3, 4, 5, 6, 7, 8] },
        { group: "right", seats: [9, 10] },
      ];
      break;

    case 100:
      // 10 rows (A-J), 10 seats per row: Left 2, Center 6, Right 2
      rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
      columns = [
        { group: "left", seats: [1, 2] },
        { group: "center", seats: [3, 4, 5, 6, 7, 8] },
        { group: "right", seats: [9, 10] },
      ];
      break;

    case 120:
      // 10 rows (A-J), 12 seats per row: Left 3, Center 6, Right 3
      rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
      columns = [
        { group: "left", seats: [1, 2, 3] },
        { group: "center", seats: [4, 5, 6, 7, 8, 9] },
        { group: "right", seats: [10, 11, 12] },
      ];
      break;

    case 150:
    default:
      // 10 rows (A-J), 15 seats per row: Left 4, Center 7, Right 4
      rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
      columns = [
        { group: "left", seats: [1, 2, 3, 4] },
        { group: "center", seats: [5, 6, 7, 8, 9, 10, 11] },
        { group: "right", seats: [12, 13, 14, 15] },
      ];
      capacity = 150;
      break;
  }

  // Format theme variations based on Admin Screen Format
  switch (formatType) {
    case "IMAX":
      return {
        rows,
        columns,
        totalSeats: capacity,
        formatType,
        screenLabel: "IMAX CURVED LASER SCREEN",
        screenGradient: "from-transparent via-cyan-400 to-transparent",
        screenGlow: "shadow-[0_0_30px_rgba(34,211,238,0.55)]",
        screenBorder: "border-cyan-500/40",
        badgeBg: "bg-cyan-500/10 border-cyan-500/30",
        badgeText: "text-cyan-400",
        specialRows: {
          G: "IMAX Sweet Spot",
          H: "Prime Laser FOV",
        },
        specialFeatures: ["Curved Laser Screen", "Expanded 1.90:1 Aspect", "Precision Laser Audio"],
        rowCurvature: true,
      };

    case "4DX":
      return {
        rows,
        columns,
        totalSeats: capacity,
        formatType,
        screenLabel: "4DX DYNAMIC MOTION SCREEN",
        screenGradient: "from-transparent via-red-500 to-transparent",
        screenGlow: "shadow-[0_0_30px_rgba(239,68,68,0.55)]",
        screenBorder: "border-red-500/40",
        badgeBg: "bg-red-500/10 border-red-500/30",
        badgeText: "text-red-400",
        specialRows: {
          D: "Optimal Motion Zone",
          E: "Optimal Motion Zone",
        },
        specialFeatures: ["Motion Synchronization", "Environmental FX", "Wind & Scent Pods"],
      };

    case "DOLBY":
      return {
        rows,
        columns,
        totalSeats: capacity,
        formatType,
        screenLabel: "DOLBY ATMOS IMMERSIVE SOUNDSTAGE",
        screenGradient: "from-transparent via-indigo-400 to-transparent",
        screenGlow: "shadow-[0_0_30px_rgba(129,140,248,0.55)]",
        screenBorder: "border-indigo-500/40",
        badgeBg: "bg-indigo-500/10 border-indigo-500/30",
        badgeText: "text-indigo-400",
        specialRows: {
          E: "Dolby Acoustic Sweet Spot",
          F: "Dolby Acoustic Sweet Spot",
        },
        specialFeatures: ["Dolby Atmos 64ch", "Sub-bass Transducers", "Acoustic Tuning"],
      };

    case "STANDARD":
    case "2D":
    default:
      return {
        rows,
        columns,
        totalSeats: capacity,
        formatType: "STANDARD",
        screenLabel: "STANDARD DIGITAL SCREEN",
        screenGradient: "from-transparent via-cine-red to-transparent",
        screenGlow: "shadow-[0_0_30px_rgba(228,22,42,0.45)]",
        screenBorder: "border-cine-red/40",
        badgeBg: "bg-cine-red/10 border-cine-red/30",
        badgeText: "text-cine-red",
        specialRows: {
          F: "VIP Center View",
        },
        specialFeatures: ["4K Laser Clarity", "7.1 Surround Sound", "Ergonomic Rockers"],
      };
  }
}

function generateInitialReserved(rows: string[], maxSeatNum: number): Set<string> {
  const reserved = new Set<string>();
  const seed = [
    { row: rows[0] || "A", num: 1 },
    { row: rows[0] || "A", num: Math.min(4, maxSeatNum) },
    { row: rows[2] || "C", num: Math.min(2, maxSeatNum) },
    { row: rows[2] || "C", num: Math.min(3, maxSeatNum) },
    { row: rows[3] || "D", num: Math.min(5, maxSeatNum) },
    { row: rows[3] || "D", num: Math.min(6, maxSeatNum) },
    { row: rows[5] || "F", num: Math.min(3, maxSeatNum) },
    { row: rows[6] || "G", num: Math.min(4, maxSeatNum) },
  ];
  seed.forEach((s) => {
    if (s.row && s.num > 0) reserved.add(`${s.row}${s.num}`);
  });
  return reserved;
}

export default function SeatSelectionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMovieById } = useMovies();
  const locationState = useLocation().state as {
    date?: string;
    cinema?: string;
    hall?: string;
    format?: string;
    time?: string;
    capacity?: number;
  } | null;

  const movie: MovieData | undefined =
    (id ? (getMovieById(id) as MovieData) : undefined) ||
    nowShowing.find((m) => m.id === id) ||
    nowShowingGrid.find((m) => m.id === id);

  const initialFormat = locationState?.format || "IMAX 2D";
  const timeLabel = locationState?.time || "18:30";
  const cinemaLabel = locationState?.cinema || "CineStar Downtown";
  const hallLabel = locationState?.hall || "Hall 1";
  const dateLabel = locationState?.date || "Today";

  // Dynamic capacity and format states
  const [selectedCapacity, setSelectedCapacity] = useState<number>(() => {
    return Number(locationState?.capacity) || 120;
  });
  const [selectedFormat, setSelectedFormat] = useState<string>(() => initialFormat);

  // Auto-resolve hall specifications from Admin venue halls if available
  useEffect(() => {
    let isMounted = true;
    async function resolveFromAdminHalls() {
      try {
        const venues = await fetchAdminVenues();
        for (const v of venues) {
          if (v.halls && Array.isArray(v.halls)) {
            const match = v.halls.find(
              (h) =>
                h.name.toLowerCase() === hallLabel.toLowerCase() ||
                h.name.toLowerCase().includes(hallLabel.toLowerCase())
            );
            if (match && isMounted) {
              if (match.capacity) setSelectedCapacity(match.capacity);
              if (match.screenType) setSelectedFormat(match.screenType);
              break;
            }
          }
        }
      } catch {}
    }

    if (!locationState?.capacity) {
      resolveFromAdminHalls();
    }
    return () => {
      isMounted = false;
    };
  }, [hallLabel, locationState?.capacity]);

  // Compute dynamic seat layout based on capacity & format
  const layout = useMemo(() => {
    return generateSeatLayout(selectedCapacity, selectedFormat);
  }, [selectedCapacity, selectedFormat]);

  const maxSeatInRow = useMemo(() => {
    return Math.max(
      ...layout.columns.flatMap((c) => c.seats),
      10
    );
  }, [layout]);

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [occupiedSeats, setOccupiedSeats] = useState<Set<string>>(() =>
    generateInitialReserved(layout.rows, maxSeatInRow)
  );

  // Sync occupied seats from backend API for this screening
  useEffect(() => {
    if (movie?.title) {
      const params = new URLSearchParams();
      params.set("movieTitle", movie.title);
      if (dateLabel) params.set("screeningDate", dateLabel);
      if (timeLabel) params.set("screeningTime", timeLabel);

      fetch(`http://localhost:5000/api/bookings/occupied-seats?${params.toString()}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.occupiedSeats && Array.isArray(data.occupiedSeats)) {
            const merged = new Set(generateInitialReserved(layout.rows, maxSeatInRow));
            data.occupiedSeats.forEach((s: string) => merged.add(s.toUpperCase().trim()));
            setOccupiedSeats(merged);
          }
        })
        .catch(() => {});
    }
  }, [movie?.title, dateLabel, timeLabel, layout.rows, maxSeatInRow]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-cine-bg">
        <Header />
        <main className="flex items-center justify-center py-32">
          <p className="text-lg text-cine-text">Movie not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  function toggleSeat(seatId: string) {
    if (occupiedSeats.has(seatId.toUpperCase())) return;
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  }

  const ticketCount = selectedSeats.length;
  const subtotal = ticketCount * SEAT_PRICE;
  const serviceFee = subtotal * SERVICE_FEE_RATE;
  const total = subtotal + serviceFee;

  return (
    <div className="min-h-screen bg-cine-bg">
      <Header />
      <main className="pb-16">
        {/* Navigation Breadcrumb */}
        <div className="mx-auto max-w-7xl px-4 pt-6">
          <Link
            to={`/select-screen/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-cine-text transition-colors hover:text-cine-white"
          >
            <ArrowLeft size={14} />
            <span>Back to Screen Selection</span>
          </Link>
        </div>

        <div className="mx-auto mt-6 max-w-7xl px-4">
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Seat Layout Main Column */}
            <div className="flex-1">
              {/* Header Details */}
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h1 className="text-2xl font-black text-cine-white md:text-3xl">
                    {movie.title}
                  </h1>
                  <div className="mt-1 flex items-center gap-2 text-xs text-cine-text flex-wrap">
                    <span className="flex items-center gap-1 font-medium text-cine-white">
                      <MapPin size={12} className="text-cine-red" />
                      {cinemaLabel}
                    </span>
                    <span className="text-cine-border">&bull;</span>
                    <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                      {hallLabel}
                    </span>
                    <span className="text-cine-border">&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {timeLabel}
                    </span>
                    <span className="text-cine-border">&bull;</span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-400">
                      <Users size={12} className="text-cine-red" />
                      <span>{layout.totalSeats} Seats Capacity</span>
                    </span>
                  </div>
                </div>

                {/* Format Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded-md border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${layout.badgeBg} ${layout.badgeText}`}>
                    {layout.formatType}
                  </span>
                  <span className="rounded-md border border-cine-border bg-cine-card px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-cine-white">
                    {layout.totalSeats} SEATS
                  </span>
                </div>
              </div>

              {/* Cinema Screen Visual & Seat Grid */}
              <div className="mt-8 flex flex-col items-center">
                {/* Cinema Screen Curved Beam */}
                <div className="relative mb-10 w-full max-w-xl text-center">
                  <div
                    className={`mx-auto h-1.5 w-4/5 rounded-full bg-gradient-to-r ${layout.screenGradient} ${layout.screenGlow} transition-all duration-500`}
                  />
                  <div
                    className={`mx-auto mt-1 h-0.5 w-3/5 rounded-full bg-gradient-to-r ${layout.screenGradient} opacity-60`}
                  />
                  <p className="mt-3.5 text-center text-[10px] font-mono font-extrabold uppercase tracking-[0.35em] text-cine-white/70">
                    {layout.screenLabel}
                  </p>

                  {/* Feature Pills for the Screen Format */}
                  {layout.specialFeatures && (
                    <div className="mt-2 flex items-center justify-center gap-2">
                      {layout.specialFeatures.map((feat) => (
                        <span
                          key={feat}
                          className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[9px] font-mono text-zinc-400"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Seating Grid dynamically rendered according to Capacity & Screen Format */}
                <div className="w-full max-w-2xl overflow-x-auto pb-4">
                  <div className="min-w-fit mx-auto flex flex-col items-center">
                    {layout.rows.map((row) => {
                      const isSpecialRow = layout.specialRows && layout.specialRows[row];
                      return (
                        <div
                          key={row}
                          className="mb-2.5 flex items-center justify-center gap-2 relative group"
                        >
                          {/* Left Row Identifier */}
                          <span
                            className={`w-5 text-right font-mono text-[11px] font-bold ${
                              isSpecialRow ? layout.badgeText : "text-zinc-500"
                            }`}
                          >
                            {row}
                          </span>

                          {/* Seat Groups (Left, Center, Right) */}
                          <div className="flex items-center gap-3">
                            {layout.columns.map((group, gi) => (
                              <div key={gi} className="flex gap-1.5">
                                {group.seats.map((seatNum) => {
                                  const seatId = `${row}${seatNum}`;
                                  const isReserved = occupiedSeats.has(seatId.toUpperCase());
                                  const isSelected = selectedSeats.includes(seatId);

                                  return (
                                    <button
                                      key={seatId}
                                      disabled={isReserved}
                                      onClick={() => toggleSeat(seatId)}
                                      title={`Seat ${seatId}${isSpecialRow ? ` (${isSpecialRow})` : ""}`}
                                      className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg font-mono text-[10px] font-bold transition-all ${
                                        isReserved
                                          ? "cursor-not-allowed bg-[#18181f] text-zinc-700 border border-zinc-800/60"
                                          : isSelected
                                          ? "bg-cine-red text-white shadow-md shadow-cine-red/50 scale-105 border border-red-400"
                                          : isSpecialRow
                                          ? "bg-[#252533] border border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/20 hover:scale-105"
                                          : "bg-[#24242e] border border-zinc-700/60 text-zinc-300 hover:bg-cine-red/30 hover:border-cine-red/60 hover:text-white"
                                      }`}
                                    >
                                      {seatNum}
                                    </button>
                                  );
                                })}
                              </div>
                            ))}
                          </div>

                          {/* Right Row Identifier */}
                          <span
                            className={`w-5 text-left font-mono text-[11px] font-bold ${
                              isSpecialRow ? layout.badgeText : "text-zinc-500"
                            }`}
                          >
                            {row}
                          </span>

                          {/* Special Row Label Tag */}
                          {isSpecialRow && (
                            <span className="hidden xl:inline-block absolute -right-32 font-mono text-[9px] uppercase tracking-wider text-cyan-400/80 bg-cyan-950/40 border border-cyan-500/20 rounded px-2 py-0.5">
                              {isSpecialRow}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 rounded-xl border border-cine-border bg-cine-card/40 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3.5 w-3.5 rounded-md bg-[#24242e] border border-zinc-700" />
                    <span className="text-xs text-cine-text font-body">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3.5 w-3.5 rounded-md bg-cine-red shadow-sm shadow-cine-red/50" />
                    <span className="text-xs text-cine-white font-body font-medium">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3.5 w-3.5 rounded-md bg-[#18181f] border border-zinc-800" />
                    <span className="text-xs text-zinc-600 font-body">Reserved</span>
                  </div>
                  {layout.formatType === "IMAX" && (
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3.5 w-3.5 rounded-md bg-[#252533] border border-cyan-500/60" />
                      <span className="text-xs text-cyan-300 font-body">IMAX Sweet Spot</span>
                    </div>
                  )}
                  {layout.formatType === "DOLBY" && (
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3.5 w-3.5 rounded-md bg-[#252533] border border-indigo-500/60" />
                      <span className="text-xs text-indigo-300 font-body">Atmos Acoustic Zone</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Order Summary Sidebar */}
            <div className="w-full shrink-0 lg:w-80">
              <div className="sticky top-24 overflow-hidden rounded-2xl border border-cine-border bg-cine-card shadow-2xl">
                <div className="aspect-[2/3] w-full overflow-hidden bg-zinc-950">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-cine-white">
                    {movie.title}
                  </h3>
                  <p className="mt-1 text-xs text-cine-text font-body">
                    {layout.formatType} &bull; {cinemaLabel} &bull; {dateLabel}, {timeLabel}
                  </p>

                  <div className="mt-4 space-y-3 border-t border-cine-border pt-4 font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold uppercase tracking-wider text-cine-text">
                        Selected Seats
                      </span>
                      {selectedSeats.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {(() => {
                            const grouped: Record<string, string[]> = {};
                            selectedSeats.forEach((s) => {
                              const row = s[0];
                              const num = s.slice(1);
                              if (!grouped[row]) grouped[row] = [];
                              grouped[row].push(num);
                            });
                            return Object.entries(grouped).map(([row, nums]) => (
                              <span
                                key={row}
                                className="text-[11px] font-bold text-cine-red"
                              >
                                {row}:{nums.join(",")}
                              </span>
                            ));
                          })()}
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-500">
                          None selected
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold uppercase tracking-wider text-cine-text">
                        Tickets ({ticketCount})
                      </span>
                      <span className="font-bold text-cine-white">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold uppercase tracking-wider text-cine-text">
                        Service Fee
                      </span>
                      <span className="font-bold text-cine-white">
                        ${serviceFee.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-cine-border pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cine-text">
                          TOTAL AMOUNT
                        </span>
                        <p className="mt-0.5 text-xl font-black text-cine-white">
                          ${total.toFixed(2)}
                        </p>
                      </div>
                      <span className="mt-1 rounded bg-cine-card-hover px-2 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider text-cine-text">
                        GST INCLUDED
                      </span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      disabled={selectedSeats.length === 0}
                      onClick={() =>
                        navigate(`/checkout/${id}`, {
                          state: {
                            date: dateLabel,
                            cinema: cinemaLabel,
                            hall: hallLabel,
                            format: layout.formatType,
                            time: timeLabel,
                            seats: selectedSeats,
                            ticketCount,
                            subtotal,
                            serviceFee,
                            total,
                          },
                        })
                      }
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-mono font-bold uppercase tracking-wider text-white transition-all ${
                        selectedSeats.length === 0
                          ? "cursor-not-allowed bg-cine-red/40"
                          : "bg-cine-red shadow-lg shadow-cine-red/40 hover:bg-cine-red/90"
                      }`}
                    >
                      <span>Proceed to Checkout</span>
                      <span>&rarr;</span>
                    </button>
                    <p className="mt-3 text-center text-[10px] text-cine-text/60 font-body">
                      Reservation held for 10 minutes upon seat selection
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
