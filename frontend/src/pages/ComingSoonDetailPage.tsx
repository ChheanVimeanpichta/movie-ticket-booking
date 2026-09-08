import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Calendar,
  Check,
  Clock,
  Film,
  Star,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MovieCard from "@/components/MovieCard";
import { comingSoon } from "@/data/movies";
import { useNotifications } from "@/context/NotificationContext";
import { useMovies } from "@/context/MovieContext";

export default function ComingSoonDetailPage() {
  const { id } = useParams<string>();
  const [reminded, setReminded] = useState(false);
  const { addReminder, addNotification, reminders } = useNotifications();
  const { comingSoonList, getMovieById } = useMovies();

  const movie = (comingSoonList.find((m) => m.id === id) || (id ? getMovieById(id) : undefined) || comingSoon.find((m) => m.id === id)) as any;

  useEffect(() => {
    setReminded(false);
  }, [id]);

  const alreadyReminded =
    movie != null && reminders.some((r) => r.movieId === movie.id);

  function handleRemind() {
    if (!movie) return;
    if (!alreadyReminded) {
      addReminder({
        movieId: movie.id,
        title: movie.title,
        releaseDate: movie.releaseDate ?? "",
      });
      addNotification({
        title: "Release Reminder Set",
        description: `We'll alert you when "${movie.title}" releases on ${movie.releaseDate}.`,
        category: "Promotions",
        badge: "REMINDER",
        iconType: "bell",
      });
    }
    setReminded(true);
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-cine-bg">
        <Header />
        <main className="flex flex-col items-center justify-center py-32 text-center">
          <p className="text-lg text-cine-text">Movie not found</p>
          <Link
            to="/coming-soon"
            className="mt-4 inline-block rounded bg-cine-red px-6 py-2 text-sm font-bold text-white"
          >
            Back to Coming Soon
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const otherMovies = (comingSoonList.length > 1 ? comingSoonList : comingSoon).filter((m) => m.id !== movie.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-cine-bg">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <img
            src={movie.landscape}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cine-bg via-cine-bg/70 to-cine-bg/30" />
          <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-12 sm:px-6 lg:px-8">
            <Link
              to="/coming-soon"
              className="inline-flex items-center gap-2 text-cine-red transition-opacity hover:opacity-80"
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em]">
                Coming Soon
              </span>
            </Link>

            <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end">
              <img
                src={movie.poster}
                alt={`${movie.title} poster`}
                className="h-80 w-52 shrink-0 rounded-xl border border-cine-border object-cover shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
              />
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-cine-red px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                    Coming {movie.releaseDate}
                  </span>
                  <span className="rounded border border-white/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/80">
                    {movie.genre}
                  </span>
                </div>
                <h1 className="mt-4 font-display text-4xl font-black italic tracking-tight text-cine-white [text-shadow:0_0_30px_rgba(228,22,42,0.35)] sm:text-6xl">
                  {movie.title}
                </h1>
                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-cine-text-light">
                  <span className="inline-flex items-center gap-1.5">
                    <Star size={12} className="fill-cine-pink text-cine-pink" />
                    {movie.rating}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={12} className="text-cine-red" />
                    {movie.runtime}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Film size={12} className="text-cine-red" />
                    {movie.genre}
                  </span>
                </p>
                <p className="mt-5 text-sm leading-relaxed text-cine-text">
                  {movie.synopsis}
                </p>
                <div className="mt-8 flex items-center gap-3">
                  <button
                    onClick={handleRemind}
                    className={`inline-flex items-center gap-2 rounded px-6 py-3 text-sm font-bold text-white transition-all ${
                      reminded || alreadyReminded
                        ? "bg-white/15 text-cine-white"
                        : "bg-cine-red hover:bg-cine-red/80"
                    }`}
                  >
                    {reminded || alreadyReminded ? <Check size={16} /> : <Bell size={16} />}
                    {reminded || alreadyReminded ? "Reminder Set" : "Remind Me"}
                  </button>
                  <button className="rounded border border-white/25 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-cine-red hover:text-cine-red">
                    Watch Trailer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Details */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <h2 className="flex items-center gap-2.5 text-base font-bold text-cine-white">
                <span className="h-4 w-1 rounded bg-cine-red" />
                About the Film
              </h2>
              <p className="mt-4 text-sm leading-7 text-cine-text">
                {movie.synopsis} Get ready to experience the most anticipated
                film of the season exclusively at CineStar. Stay tuned for showtimes,
                ticket prices, and early-bird offers — only for CineClub members.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-cine-border bg-cine-card p-5">
                  <Calendar size={16} className="text-cine-red" />
                  <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text">
                    Release Date
                  </p>
                  <p className="mt-1 text-sm font-bold text-cine-white">
                    {movie.releaseDate}
                  </p>
                </div>
                <div className="rounded-xl border border-cine-border bg-cine-card p-5">
                  <Clock size={16} className="text-cine-red" />
                  <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text">
                    Runtime
                  </p>
                  <p className="mt-1 text-sm font-bold text-cine-white">
                    {movie.runtime}
                  </p>
                </div>
                <div className="rounded-xl border border-cine-border bg-cine-card p-5">
                  <Star size={16} className="text-cine-red" />
                  <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text">
                    Rating
                  </p>
                  <p className="mt-1 text-sm font-bold text-cine-white">
                    {movie.rating}
                  </p>
                </div>
              </div>
            </div>

            <aside>
              <h2 className="flex items-center gap-2.5 text-base font-bold text-cine-white">
                <span className="h-4 w-1 rounded bg-cine-red" />
                Available In
              </h2>
              <div className="mt-4 space-y-3">
                {["IMAX 2D", "3D", "4DX"].map((format) => (
                  <div
                    key={format}
                    className="flex items-center justify-between rounded-xl border border-cine-border bg-cine-card px-4 py-3.5"
                  >
                    <span className="text-sm font-semibold text-cine-white">
                      {format}
                    </span>
                    <span className="rounded-full bg-cine-red/15 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-cine-red">
                      Premium
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-cine-red/40 bg-gradient-to-br from-[#3a0d12] via-[#5c0f1c] to-[#7a1220] p-5">
                <p className="text-sm font-black text-cine-white">
                  Be First in Line
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-cine-text-light">
                  Get priority access to tickets the moment they go on sale.
                </p>
                <button
                  onClick={handleRemind}
                  className="mt-4 w-full rounded-full bg-white py-2.5 text-xs font-black uppercase tracking-wide text-[#1a1a1a] transition-colors hover:bg-cine-text-light"
                >
                  {reminded || alreadyReminded ? "Reminder Set" : "Notify Me"}
                </button>
              </div>
            </aside>
          </div>
        </section>

        {/* More Coming Soon */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2.5 text-base font-bold text-cine-white">
              <span className="h-4 w-1 rounded bg-cine-red" />
              More Coming Soon
            </h2>
            <Link
              to="/coming-soon"
              className="text-xs font-semibold text-cine-red transition-opacity hover:opacity-80"
            >
              View All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {otherMovies.map((m) => (
              <MovieCard key={m.id} movie={m} variant="poster" isComingSoon />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
