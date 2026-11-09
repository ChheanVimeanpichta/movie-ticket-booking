import { Link, useNavigate } from "react-router-dom";
import { Star, Info, Calendar, Sparkles } from "lucide-react";
import type { Movie } from "@/data/movies";

export default function MovieCard({
  movie,
  variant = "poster",
  isComingSoon,
}: {
  movie: Movie;
  variant?: "poster" | "landscape";
  isComingSoon?: boolean;
}) {
  const navigate = useNavigate();

  const comingSoon =
    isComingSoon ??
    Boolean(
      movie.releaseDate && (!movie.showtimes || movie.showtimes.length === 0)
    );
  const targetUrl = comingSoon
    ? `/coming-soon/${movie.id}`
    : `/select-screen/${movie.id}`;

  if (variant === "landscape") {
    return (
      <Link
        to={targetUrl}
        className="group relative block overflow-hidden rounded bg-cine-card transition-all duration-300 hover:bg-cine-card-hover hover:-translate-y-1"
      >
        <div className="aspect-video w-full overflow-hidden relative">
          <img
            src={movie.landscape || movie.poster}
            alt={`${movie.title} still`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {movie.hasShowtimeToday && (
            <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5 rounded-full bg-emerald-600/90 border border-emerald-400/40 px-2 py-0.5 shadow backdrop-blur-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-white">
                Today
              </span>
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between gap-1">
            <h3 className="truncate font-body text-sm font-semibold text-cine-white transition-colors group-hover:text-cine-red">
              {movie.title}
            </h3>
            {movie.hasShowtimeToday && (
              <span className="shrink-0 rounded bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold uppercase text-emerald-400">
                Today
              </span>
            )}
          </div>
          {movie.releaseDate && (
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-cine-pink">
              <Calendar size={11} />
              COMING {movie.releaseDate}
            </p>
          )}
          <p className="mt-0.5 text-xs text-cine-text">
            {movie.genre} &middot; {movie.runtime}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <div className="group relative block">
      <Link
        to={targetUrl}
        className="relative block overflow-hidden rounded bg-cine-card transition-all duration-300 hover:shadow-xl hover:shadow-black/60"
      >
        <div className="aspect-[3/4] w-full overflow-hidden">
          <img
            src={movie.poster || movie.landscape}
            alt={`${movie.title} poster`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Top Left Badge: Release date or Rating */}
        {comingSoon && movie.releaseDate ? (
          <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded bg-cine-red/90 px-2 py-1 shadow backdrop-blur-xs">
            <Calendar size={11} className="text-white" />
            <span className="font-mono text-xs font-bold uppercase text-white">
              {movie.releaseDate}
            </span>
          </div>
        ) : movie.score != null && movie.score > 0 ? (
          <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded bg-black/75 border border-white/20 px-2 py-1 shadow backdrop-blur-xs">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="font-mono text-xs font-bold text-white">
              {movie.score}
            </span>
          </div>
        ) : null}

        {/* Top Right Badge: Today or Recommended */}
        {movie.hasShowtimeToday ? (
          <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5 rounded-full bg-emerald-600/90 border border-emerald-400/40 px-2 py-0.5 shadow-md backdrop-blur-xs">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white">
              Today
            </span>
          </div>
        ) : movie.isRecommended && !comingSoon ? (
          <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 border border-amber-300/40 px-2 py-0.5 shadow-md backdrop-blur-xs">
            <Sparkles size={10} className="fill-white text-white" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white">
              Top Pick
            </span>
          </div>
        ) : null}

        {/* Hover Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-cine-pink">
              {movie.genre}
            </p>
            <p className="mt-1 text-sm font-bold leading-tight text-white">
              {movie.title}
            </p>
            <p className="mt-1 text-xs text-cine-text-light">
              {comingSoon && movie.releaseDate
                ? `Releasing ${movie.releaseDate}`
                : `${movie.rating} · ${movie.runtime}`}
            </p>
            {movie.hasShowtimeToday && (
              <p className="mt-1.5 inline-flex items-center gap-1.5 rounded bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                {movie.showtimeCountToday && movie.showtimeCountToday > 0
                  ? `${movie.showtimeCountToday} showtimes today`
                  : "Showtimes today"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(targetUrl);
              }}
              className="flex-1 inline-flex items-center justify-center rounded bg-cine-red px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-cine-red/80 shadow-md shadow-cine-red/20"
            >
              {comingSoon ? "View Details" : "Book Ticket"}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(targetUrl);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-white/80 transition-colors hover:border-white hover:text-white"
              title={comingSoon ? "View Details" : "Select Showtime"}
            >
              <Info size={15} />
            </button>
          </div>
        </div>
      </Link>

      <div className="mt-2 px-0.5">
        <div className="flex items-center justify-between gap-1">
          <p className="truncate text-sm font-semibold text-cine-white transition-colors group-hover:text-cine-red">
            {movie.title}
          </p>
          {movie.hasShowtimeToday ? (
            <span className="shrink-0 rounded bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold uppercase text-emerald-400">
              Today
            </span>
          ) : movie.isRecommended && !comingSoon ? (
            <span className="shrink-0 rounded bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-bold uppercase text-amber-400">
              Pick
            </span>
          ) : null}
        </div>
        <p className="text-xs text-cine-text truncate mt-0.5">
          {movie.rating} &middot; {movie.genre} &middot; {movie.runtime}
        </p>
      </div>
    </div>
  );
}
