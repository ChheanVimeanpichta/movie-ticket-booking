import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MovieCard from "@/components/MovieCard";
import { nowShowing, comingSoon, heroSlides } from "@/data/movies";
import { Link } from "react-router-dom";
import { Play, ArrowRight } from "lucide-react";

export default function Home() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % heroSlides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = heroSlides[current];

  return (
    <>
      <Header />

      <main>
        <section className="relative isolate overflow-hidden h-[85vh] min-h-[600px]">
          {heroSlides.map((s, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                i === current ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={s.image}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-cine-bg via-cine-bg/60 to-cine-bg/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-cine-bg/50 via-transparent to-transparent" />

          <div className="absolute inset-0 mx-auto flex max-w-7xl items-end px-4 pb-20 sm:px-6 lg:px-8">
            <div className="w-full">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {slide.badges.map((badge) => {
                  const isFilled = badge === "NOW SHOWING";
                  return (
                    <span
                      key={badge}
                      className={`text-[10px] font-semibold tracking-widest px-3 py-1 rounded ${
                        isFilled
                          ? "bg-cine-red text-white"
                          : "border border-white/30 text-white/80"
                      }`}
                    >
                      {badge}
                    </span>
                  );
                })}
              </div>

              <h1 className="font-display text-6xl sm:text-7xl md:text-8xl font-black italic uppercase leading-[0.9] text-cine-white">
                {slide.title}
                <br />
                <span className="text-cine-pink">{slide.subtitle}</span>
              </h1>

              <p className="mt-4 max-w-lg text-sm leading-relaxed text-cine-text">
                {slide.description}
              </p>

              <div className="mt-8 flex items-center gap-4">
                <Link
                  to="/movies"
                  className="inline-flex items-center gap-2 rounded bg-cine-red px-7 py-3 font-body text-sm font-bold text-white transition-colors hover:bg-cine-red/90"
                >
                  BOOK NOW
                  <ArrowRight size={16} />
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <Play size={16} fill="currentColor" />
                  TRAILER
                </button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 right-8 flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? "w-6 bg-cine-red" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-cine-red uppercase">
                Now in Theaters
              </p>
              <h2 className="font-display text-3xl font-black text-cine-white sm:text-4xl">
                NOW SHOWING
              </h2>
            </div>
            <a
              href="#"
              className="text-xs font-medium text-cine-text hover:text-cine-red transition-colors"
            >
              VIEW ALL MOVIES &rarr;
            </a>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {nowShowing.slice(0, 4).map((movie) => (
              <MovieCard key={movie.id} movie={movie} variant="poster" />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
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
            {comingSoon.slice(0, 4).map((movie) => (
              <MovieCard key={movie.id} movie={movie} variant="landscape" />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
