import { Link, useNavigate } from "react-router-dom";
import { Star, Info, Calendar } from "lucide-react";
import type { Movie } from "@/data/movies";

export default function MovieCard({
  movie,
  variant = "poster",
}: {
  movie: Movie;
  variant?: "poster" | "landscape";
}) {
  const navigate = useNavigate();
  if (variant === "landscape") {
    return (
      <Link
        to={`/movies/${movie.id}`}
        className="group relative block overflow-hidden rounded bg-cine-card transition-all duration-300 hover:bg-cine-card-hover hover:-translate-y-1"
      >
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={movie.landscape}
            alt={`${movie.title} still`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-3">
          <h3 className="truncate font-body text-sm font-semibold text-cine-white transition-colors group-hover:text-cine-red">
            {movie.title}
          </h3>
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
        to={`/movies/${movie.id}`}
        className="relative block overflow-hidden rounded bg-cine-card"
      >
        <div className="aspect-[3/4] w-full">
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>

        {movie.score > 0 && (
          <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded bg-cine-red/90 px-2 py-1">
            <Star size={12} className="fill-white text-white" />
            <span className="font-mono text-xs font-bold text-white">
              {movie.score}
            </span>
          </div>
        )}

        <div className="absolute inset-0 z-10 flex flex-col justify-between bg-gradient-to-t from-black/95 via-black/50 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-cine-pink">
              {movie.genre}
            </p>
            <p className="mt-1 text-sm font-bold leading-tight text-white">
              {movie.title}
            </p>
            <p className="mt-1 text-xs text-cine-text-light">
              {movie.rating} &middot; {movie.runtime}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/select-screen/${movie.id}`);
              }}
              className="flex-1 inline-flex items-center justify-center rounded bg-cine-red px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-cine-red/80"
            >
              Book
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-white/80 transition-colors hover:border-white hover:text-white"
            >
              <Info size={15} />
            </button>
          </div>
        </div>
      </Link>

      <div className="mt-2 px-0.5">
        <p className="truncate text-sm font-semibold text-cine-white transition-colors group-hover:text-cine-red">
          {movie.title}
        </p>
        <p className="text-xs text-cine-text">
          {movie.rating} &middot; {movie.genre} &middot; {movie.runtime}
        </p>
      </div>
    </div>
  );
}
