import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, Clock, Calendar, ChevronDown, ShieldAlert, AlertTriangle, RefreshCw, Building2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { nowShowing, nowShowingGrid } from "@/data/movies";
import type { Movie } from "@/data/movies";
import type { GridMovie } from "@/data/movies";
import { useAuth } from "@/context/AuthContext";
import { useMovies } from "@/context/MovieContext";
import {
  useMovieShowtimes,
  buildSessionsForCinema,
  isHallName,
  type SessionCategory,
} from "@/services/showtimeService";
import ShowtimeNoticeModal from "@/components/shared/ShowtimeNoticeModal";

type MovieData = (Movie | GridMovie) & { synopsis?: string; rating?: string; runtime?: string; landscape?: string };

function generateDates() {
  const dates: { label: string; full: string; day: number; month: string }[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const label =
      i === 0
        ? "Today"
        : i === 1
          ? "Tomorrow"
          : d.toLocaleDateString("en-US", { weekday: "short" });
    dates.push({
      label,
      full: d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      day: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  return dates;
}

const DATES = generateDates();

const CINEMA_OPTIONS = [
  "CineStar Downtown",
  "CineStar Riverside",
  "CineStar Westgate",
  "Cinestar Olypia Mall",
];

const CINEMA_SESSIONS: Record<string, SessionCategory[]> = {
  "IMAX Zenith Center, Plaza West": [
    {
      name: "IMAX 2D EXPERIENCE",
      price: "$18.50 per ticket",
      times: ["14:30", "17:00", "20:30", "23:00"],
      soldOut: [],
    },
    {
      name: "4DX IMMERSIVE",
      price: "$22.00 per ticket",
      times: ["12:00", "15:00", "17:30", "20:00"],
      soldOut: ["17:30"],
    },
    {
      name: "STANDARD DIGITAL",
      price: "$14.00 per ticket",
      times: ["11:00", "13:30", "16:00", "18:30", "21:00"],
      soldOut: [],
    },
  ],
  "Grand Cinema Hall, Downtown": [
    {
      name: "DIGITAL 2D",
      price: "$12.00 per ticket",
      times: ["10:00", "13:00", "16:00", "19:00", "22:00"],
      soldOut: [],
    },
    {
      name: "DOLBY ATMOS",
      price: "$16.50 per ticket",
      times: ["11:30", "14:30", "17:30", "20:30"],
      soldOut: ["20:30"],
    },
    {
      name: "SCREEN X",
      price: "$19.00 per ticket",
      times: ["12:00", "15:00", "18:00", "21:00"],
      soldOut: [],
    },
  ],
  "Starlight Theater, Northside": [
    {
      name: "DIGITAL 2D",
      price: "$11.00 per ticket",
      times: ["09:30", "12:30", "15:30", "18:30", "21:30"],
      soldOut: [],
    },
    {
      name: "IMAX 2D",
      price: "$17.00 per ticket",
      times: ["11:00", "14:00", "17:00", "20:00"],
      soldOut: [],
    },
    {
      name: "VIP LOUNGE",
      price: "$25.00 per ticket",
      times: ["13:00", "16:00", "19:00", "22:00"],
      soldOut: ["19:00"],
    },
  ],
  "Cineplex 8, Eastgate Mall": [
    {
      name: "STANDARD 2D",
      price: "$10.50 per ticket",
      times: ["10:30", "13:30", "16:30", "19:30", "22:30"],
      soldOut: [],
    },
    {
      name: "REALD 3D",
      price: "$15.00 per ticket",
      times: ["12:00", "15:00", "18:00", "21:00"],
      soldOut: [],
    },
    {
      name: "D-BOX IMMERSIVE",
      price: "$21.00 per ticket",
      times: ["14:00", "17:00", "20:00", "23:00"],
      soldOut: ["23:00"],
    },
  ],
};

const DEFAULT_SESSIONS: SessionCategory[] = [
  {
    name: "IMAX 2D EXPERIENCE",
    price: "$18.50 per ticket",
    times: ["14:30", "17:00", "20:30", "23:00"],
    soldOut: [],
  },
  {
    name: "4DX IMMERSIVE",
    price: "$22.00 per ticket",
    times: ["12:00", "15:00", "17:30", "20:00"],
    soldOut: [],
  },
  {
    name: "STANDARD DIGITAL",
    price: "$14.00 per ticket",
    times: ["11:00", "13:30", "16:00", "18:30", "21:00"],
    soldOut: [],
  },
];

export default function SelectScreenPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, openLoginPopup } = useAuth();
  const { getMovieById } = useMovies();
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [cinemaOpen, setCinemaOpen] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const cinemaRef = useRef<HTMLDivElement>(null);

  const movie: MovieData | undefined =
    (id ? (getMovieById(id) as MovieData) : undefined) ||
    nowShowing.find((m) => m.id === id) ||
    nowShowingGrid.find((m) => m.id === id);

  const {
    screenings,
    cinemas: assignedCinemas,
    hasAssignedShowtimes,
    isLoading: isLoadingShowtimes,
    lastChecked,
    refetch: refetchShowtimes,
  } = useMovieShowtimes(id, movie?.title);

  const availableCinemas = useMemo(() => {
    const validAssigned = assignedCinemas.filter((c) => Boolean(c) && !isHallName(c));
    if (validAssigned.length > 0) return validAssigned;
    if (hasAssignedShowtimes) return CINEMA_OPTIONS;
    return ["No Cinema Assigned"];
  }, [assignedCinemas, hasAssignedShowtimes]);

  const [selectedCinema, setSelectedCinema] = useState(availableCinemas[0] || "CineStar Downtown");

  useEffect(() => {
    if (availableCinemas.length > 0 && !availableCinemas.includes(selectedCinema)) {
      setSelectedCinema(availableCinemas[0]);
    }
  }, [availableCinemas, selectedCinema]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cinemaRef.current && !cinemaRef.current.contains(e.target as Node)) {
        setCinemaOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cinemaSessions: SessionCategory[] = useMemo(() => {
    if (!hasAssignedShowtimes) return [];
    const built = buildSessionsForCinema(screenings, selectedCinema, DATES[selectedDate].label);
    if (built.length > 0) return built;
    const fallback = CINEMA_SESSIONS[selectedCinema] || DEFAULT_SESSIONS;
    return fallback;
  }, [hasAssignedShowtimes, screenings, selectedCinema, selectedDate]);

  const category = cinemaSessions[selectedCategory] || cinemaSessions[0] || null;

  // Auto-sync selectedTime when category or sessions change
  useEffect(() => {
    if (!hasAssignedShowtimes || cinemaSessions.length === 0) {
      setSelectedTime(null);
      return;
    }
    const currentCat = cinemaSessions[selectedCategory] || cinemaSessions[0];
    if (currentCat) {
      if (!selectedTime || !currentCat.times.includes(selectedTime)) {
        const firstAvail = currentCat.times.find((t) => !currentCat.soldOut.includes(t));
        setSelectedTime(firstAvail || null);
      }
    }
  }, [hasAssignedShowtimes, cinemaSessions, selectedCategory, selectedTime]);

  const handleProceed = () => {
    if (!hasAssignedShowtimes || !selectedTime || !category) {
      console.warn(
        `[Showtime Tracker] Booking blocked: Admin has not assigned showtimes for "${movie?.title || id}".`
      );
      setShowLogModal(true);
      return;
    }

    const hallName = category.halls && category.halls.length > 0 ? category.halls[0] : undefined;

    if (!isAuthenticated) {
      openLoginPopup(() =>
        navigate(`/select-seat/${id}`, {
          state: {
            date: DATES[selectedDate].full,
            cinema: selectedCinema,
            hall: hallName,
            format: category.name,
            time: selectedTime,
          },
        })
      );
      return;
    }

    navigate(`/select-seat/${id}`, {
      state: {
        date: DATES[selectedDate].full,
        cinema: selectedCinema,
        hall: hallName,
        format: category.name,
        time: selectedTime,
      },
    });
  };

  if (!movie) {
    return (
      <div className="min-h-screen bg-cine-bg">
        <Header />
        <main className="flex items-center justify-center py-32">
          <div className="text-center">
            <p className="text-lg text-cine-text">Movie not found</p>
            <Link
              to="/movies"
              className="mt-4 inline-block rounded bg-cine-red px-6 py-2 text-sm font-bold text-white"
            >
              Back to Movies
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hasRating = "rating" in movie && movie.rating;
  const hasRuntime = "runtime" in movie && movie.runtime;

  return (
    <div className="min-h-screen bg-cine-bg">
      <Header />
      <main className="pb-16">
        <div className="mx-auto max-w-7xl px-4 pt-8">
          <Link
            to="/movies"
            className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-cine-text transition-colors hover:text-cine-white"
          >
            ← Back to Movies
          </Link>
        </div>

        <section className="mx-auto mt-6 max-w-7xl px-4">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="w-full shrink-0 md:w-72">
              <div className="overflow-hidden rounded-xl bg-cine-card">
                <div className="aspect-[3/4] w-full">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cine-red">
                Now Showing
              </p>
              <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">
                {movie.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-cine-text">
                {"score" in movie && movie.score != null && movie.score > 0 && (
                  <span className="flex items-center gap-1 rounded bg-cine-red/10 px-2 py-1 font-bold text-cine-red">
                    <Star size={12} className="fill-cine-red" />
                    {movie.score}
                  </span>
                )}
                {hasRating && (
                  <span className="rounded border border-cine-border px-2 py-1 font-medium">
                    {movie.rating}
                  </span>
                )}
                {hasRuntime && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {movie.runtime}
                  </span>
                )}
                {movie.genre && (
                  <span className="text-cine-text-light">{movie.genre}</span>
                )}
              </div>

              {"synopsis" in movie && movie.synopsis && (
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-cine-text">
                  {movie.synopsis}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-7xl px-4">
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1 space-y-10">
              {/* SYSTEM LOG / ADMIN SHOWTIME NOTICE BANNER */}
              {!hasAssignedShowtimes && !isLoadingShowtimes && (
                <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-cine-card to-black/60 p-5 sm:p-6 shadow-[0_10px_30px_rgba(228,22,42,0.15)] animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-500/20 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                      </span>
                      <span className="font-mono text-xs font-bold uppercase tracking-widest text-red-400">
                        SYSTEM LOG &bull; SHOWTIME NOT ASSIGNED
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-cine-text">
                      <span>REF: LOG-SHOWTIME-PENDING</span>
                      <span>&bull;</span>
                      <span>LIVE ADMIN TRACKING</span>
                    </div>
                  </div>

                  <div className="mt-3.5 flex items-start gap-3.5">
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-cine-red shrink-0">
                      <ShieldAlert size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-cine-white">
                        Administrator Has Not Scheduled Showtimes
                      </h4>
                      <p className="mt-1 text-xs text-cine-text leading-relaxed">
                        The cinema administrator has not assigned showtimes or screening halls for{" "}
                        <strong className="text-cine-white">"{movie.title}"</strong> yet. Online booking and seat reservation are temporarily unavailable for this title.
                      </p>
                      <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setShowLogModal(true)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition-colors"
                        >
                          <AlertTriangle size={13} />
                          View Log Details
                        </button>
                        <button
                          type="button"
                          onClick={() => refetchShowtimes()}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-cine-text hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <RefreshCw size={13} />
                          Re-check Admin Allocation
                        </button>
                        <Link
                          to="/movies"
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-cine-text hover:text-white hover:bg-white/10 transition-colors"
                        >
                          Browse Other Movies &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h2 className="flex items-center gap-3 text-base font-bold text-white">
                  <span className="text-lg font-black text-cine-red">01</span>
                  <span className="uppercase tracking-wide">Select Date</span>
                </h2>
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                  {DATES.map((date, i) => {
                    const isSelected = selectedDate === i;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(i)}
                        className={`flex shrink-0 flex-col items-center rounded-xl px-4 py-3 transition-all ${
                          isSelected
                            ? "border-b-2 border-cine-red bg-cine-card"
                            : "bg-cine-card hover:bg-cine-card-hover"
                        }`}
                        style={{ minWidth: "70px" }}
                      >
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider ${
                            isSelected ? "text-cine-red" : "text-cine-text"
                          }`}
                        >
                          {date.label}
                        </span>
                        <span
                          className={`mt-1 text-xl font-bold ${
                            isSelected ? "text-cine-red" : "text-cine-white"
                          }`}
                        >
                          {date.day}
                        </span>
                        <span className="mt-0.5 text-[10px] text-cine-text">
                          {date.month}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-3 text-base font-bold text-white">
                    <span className="text-lg font-black text-cine-red">02</span>
                    <span className="uppercase tracking-wide">Choose Cinema Venue</span>
                  </h2>
                  {hasAssignedShowtimes && (
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Venue Tracking
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-cine-text">
                  Select an authorized CineStar venue branch assigned by admin for this title.
                </p>

                <div className="relative mt-3" ref={cinemaRef}>
                  <button
                    onClick={() => hasAssignedShowtimes && setCinemaOpen(!cinemaOpen)}
                    disabled={!hasAssignedShowtimes}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl border bg-cine-card px-5 py-4 transition-colors ${
                      !hasAssignedShowtimes
                        ? "border-red-500/30 opacity-75 cursor-not-allowed"
                        : "border-cine-border hover:bg-cine-card-hover"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cine-red/10 text-cine-red">
                        <Building2 size={16} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-cine-white">
                          {selectedCinema}
                        </p>
                        <p className="text-[10px] text-cine-text">
                          Cinema Location
                        </p>
                      </div>
                    </div>
                    {hasAssignedShowtimes && (
                      <ChevronDown
                        size={16}
                        className={`text-cine-text transition-transform ${
                          cinemaOpen ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                  {cinemaOpen && hasAssignedShowtimes && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-cine-border bg-cine-card shadow-2xl max-h-60 overflow-y-auto">
                      {availableCinemas.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setSelectedCinema(opt);
                            setSelectedCategory(0);
                            setCinemaOpen(false);
                          }}
                          className={`w-full px-5 py-3.5 text-left text-sm transition-colors hover:bg-cine-card-hover flex items-center justify-between ${
                            selectedCinema === opt
                              ? "font-bold text-cine-red bg-cine-red/10"
                              : "text-cine-text"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Building2 size={15} className={selectedCinema === opt ? "text-cine-red" : "text-cine-text/70"} />
                            <span>{opt}</span>
                          </div>
                          {selectedCinema === opt && (
                            <span className="rounded bg-cine-red/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cine-red">
                              Selected
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="flex items-center gap-3 text-base font-bold text-white">
                  <span className="text-lg font-black text-cine-red">03</span>
                  <span className="uppercase tracking-wide">Pick Your Session</span>
                </h2>
                {hasAssignedShowtimes ? (
                  cinemaSessions.length > 0 ? (
                    <div className="mt-4 space-y-4">
                      {cinemaSessions.map((cat, catIdx) => {
                        const isCatSelected = selectedCategory === catIdx;
                        const firstAvail = cat.times.find(
                          (t) => !cat.soldOut.includes(t)
                        );
                        return (
                          <div
                            key={catIdx}
                            onClick={() => {
                              setSelectedCategory(catIdx);
                              if (cat.soldOut.includes(selectedTime || "") || selectedCategory !== catIdx) {
                                setSelectedTime(firstAvail || null);
                              }
                            }}
                            className={`cursor-pointer rounded-xl border p-5 transition-all ${
                              isCatSelected
                                ? "border-cine-border bg-cine-card"
                                : "border-transparent bg-cine-card hover:bg-cine-card-hover"
                            }`}
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`text-xs font-bold uppercase tracking-widest ${
                                    isCatSelected
                                      ? "text-cine-white"
                                      : "text-cine-text"
                                  }`}
                                >
                                  {cat.name}
                                </span>
                                {cat.halls && cat.halls.length > 0 && (
                                  <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                                    {cat.halls.join(", ")}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-cine-text">{cat.price}</span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {cat.times.map((time) => {
                                const isSoldOut = cat.soldOut.includes(time);
                                const isTimeSelected =
                                  isCatSelected && selectedTime === time;
                                return (
                                  <button
                                    key={time}
                                    disabled={isSoldOut}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCategory(catIdx);
                                      setSelectedTime(
                                        selectedTime === time ? null : time
                                      );
                                    }}
                                    className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                                      isSoldOut
                                        ? "cursor-not-allowed bg-cine-card-hover text-cine-text/40 line-through"
                                        : isTimeSelected
                                          ? "bg-cine-red text-white shadow-lg shadow-cine-red/30"
                                          : "border border-cine-border bg-cine-card-hover text-cine-white hover:border-cine-red hover:bg-cine-red/10 hover:text-cine-red"
                                    }`}
                                  >
                                    {isSoldOut ? "SOLD OUT" : time}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-white/5 bg-cine-card/60 p-6 text-center">
                      <p className="text-sm font-semibold text-white">No sessions for {selectedCinema}</p>
                      <p className="mt-1 text-xs text-cine-text">
                        Try selecting another cinema or date to view assigned showtimes.
                      </p>
                    </div>
                  )
                ) : (
                  <div className="mt-4 rounded-xl border border-white/5 bg-cine-card/60 p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cine-text">
                      <Clock size={24} />
                    </div>
                    <p className="mt-3 text-sm font-bold text-cine-white">
                      No Screening Sessions Assigned
                    </p>
                    <p className="mt-1 text-xs text-cine-text max-w-sm mx-auto leading-relaxed">
                      The cinema administrator has not configured or assigned showtimes for this movie yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowLogModal(true)}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-cine-red hover:underline"
                    >
                      <ShieldAlert size={14} />
                      View Showtime Allocation Log
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full shrink-0 lg:w-80">
              <div className="sticky top-24 rounded-xl bg-cine-card p-6">
                <h3 className="text-lg font-bold text-cine-white">
                  Booking Summary
                </h3>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cine-text">Movie</span>
                    <span className="text-xs font-semibold text-cine-red">
                      {movie.title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cine-text">Date</span>
                    <span className="text-xs font-semibold text-cine-white">
                      {DATES[selectedDate].full}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cine-text">Cinema Venue</span>
                    <span className="max-w-[140px] truncate text-right text-xs font-semibold text-cine-white" title={selectedCinema}>
                      {selectedCinema}
                    </span>
                  </div>
                  {hasAssignedShowtimes && category?.halls && category.halls.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-cine-text">Screen / Hall</span>
                      <span className="max-w-[140px] truncate text-right text-xs font-semibold text-amber-300" title={category.halls.join(", ")}>
                        {category.halls.join(", ")}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cine-text">
                      Format &amp; Time
                    </span>
                    <span className="max-w-[140px] truncate text-right text-xs font-semibold text-cine-white">
                      {hasAssignedShowtimes && category ? (
                        `${category.name}${selectedTime ? `, ${selectedTime}` : ""}`
                      ) : (
                        <span className="text-red-400 font-bold flex items-center justify-end gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                          Not Assigned
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-6 border-t border-cine-border pt-6">
                  {hasAssignedShowtimes ? (
                    <button
                      onClick={handleProceed}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-cine-red py-3 text-sm font-bold text-white transition-colors hover:bg-cine-red/90"
                    >
                      Proceed to Seat Selection
                      <span className="text-base">&rarr;</span>
                    </button>
                  ) : (
                    <div className="space-y-2.5">
                      <button
                        onClick={handleProceed}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 py-3 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/20 transition-all cursor-pointer shadow-lg shadow-red-950/30"
                      >
                        <ShieldAlert size={15} />
                        Showtimes Not Assigned
                      </button>
                      <Link
                        to="/movies"
                        className="flex w-full items-center justify-center gap-1 rounded-xl border border-cine-border bg-cine-card py-2 text-xs font-semibold text-cine-text transition-colors hover:border-zinc-700 hover:text-white text-center"
                      >
                        Browse Other Movies &rarr;
                      </Link>
                    </div>
                  )}
                  <p className="mt-3 text-center text-[11px] italic text-cine-text">
                    Taxes and booking fees calculated at checkout
                  </p>
                </div>

                <div className="mt-6 overflow-hidden rounded-lg border border-cine-border bg-cine-bg p-3">
                  <div className="flex items-center justify-center">
                    <svg
                      viewBox="0 0 120 60"
                      className="h-auto w-full max-w-[120px]"
                      fill="none"
                    >
                      <rect
                        x="10"
                        y="4"
                        width="100"
                        height="6"
                        rx="3"
                        fill="#1F1F1F"
                      />
                      {[14, 24, 34, 44].map((y, ri) => (
                        <g key={ri}>
                          {[20, 30, 40, 50, 60, 70, 80, 90].map((x, si) => (
                            <rect
                              key={si}
                              x={x}
                              y={y}
                              width="6"
                              height="5"
                              rx="1"
                              fill="#1A1A1A"
                              stroke="#2A2A2A"
                              strokeWidth="0.5"
                            />
                          ))}
                        </g>
                      ))}
                      <circle cx="56" cy="34" r="4" fill="#E4162A" />
                      <circle cx="56" cy="34" r="1.5" fill="#F9FAFB" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showLogModal && (
        <ShowtimeNoticeModal
          isOpen={showLogModal}
          movieTitle={movie.title}
          movieId={id}
          lastChecked={lastChecked}
          onClose={() => setShowLogModal(false)}
          onRefresh={refetchShowtimes}
        />
      )}

      <Footer />
    </div>
  );
}
