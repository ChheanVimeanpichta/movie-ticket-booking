import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MovieCard from "@/components/MovieCard";
import { nowShowing, comingSoon, heroSlides } from "@/data/movies";
import { useMovies } from "@/context/MovieContext";
import { Link } from "react-router-dom";
import { Play, ArrowRight } from "lucide-react";

export default function Home() {
  const { nowShowingList, comingSoonList } = useMovies();
  const currentNowShowing = nowShowingList && nowShowingList.length > 0 ? nowShowingList : nowShowing;
  const currentComingSoon = comingSoonList && comingSoonList.length > 0 ? comingSoonList : comingSoon;
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % heroSlides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <>
      <Header />

      <main>
        {/* Hero Slider */}
        <section className="relative h-[85vh] min-h-[560px] max-h-[800px] w-full overflow-hidden bg-cine-black">
          {heroSlides.map((s, i) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                i === current ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
            >
              <img
                src={s.image}
                alt={s.title}
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cine-bg via-cine-bg/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-cine-bg/90 via-cine-bg/40 to-transparent" />

              <div className="absolute bottom-16 left-0 right-0 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl">
                  <span className="inline-block rounded-full bg-cine-red px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-white">
                    {s.badge}
                  </span>
                  <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-cine-white sm:text-6xl">
                    {s.title}
                  </h1>
                  <p className="mt-2 font-mono text-xs text-cine-red">
                    {s.genre} &bull; {s.release}
                  </p>
                  <p className="mt-3 text-sm text-cine-text line-clamp-3">
                    {s.description}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <Link
                      to={`/select-screen/${s.id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-cine-red px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white transition-transform hover:scale-105"
                    >
                      Book Tickets
                      <ArrowRight size={14} />
                    </Link>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-cine-border bg-cine-card/80 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-cine-white backdrop-blur transition-colors hover:bg-cine-card"
                    >
                      <Play size={14} className="fill-cine-white text-cine-white" />
                      Watch Trailer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Dots Indicator */}
          <div className="absolute bottom-6 right-8 flex gap-2 z-10">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? "w-8 bg-cine-red" : "w-2 bg-cine-border"
                }`}
              />
            ))}
          </div>
        </section>

        {/* Now Showing Section */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-cine-red uppercase">
                In Theaters Now
              </p>
              <h2 className="font-display text-3xl font-black text-cine-white sm:text-4xl">
                NOW SHOWING
              </h2>
            </div>
            <Link
              to="/movies"
              className="text-xs font-medium text-cine-text hover:text-cine-red transition-colors"
            >
              VIEW ALL &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {currentNowShowing.slice(0, 4).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-cine-red uppercase">
                Next on Screen
              </p>
              <h2 className="font-display text-3xl font-black text-cine-white sm:text-4xl">
                COMING SOON
              </h2>
            </div>
            <a
              href="/coming-soon"
              className="text-xs font-medium text-cine-text hover:text-cine-red transition-colors"
            >
              VIEW ALL MOVIES &rarr;
            </a>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {currentComingSoon.slice(0, 4).map((movie) => (
              <MovieCard key={movie.id} movie={movie} variant="landscape" />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
