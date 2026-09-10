import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MovieCard from "@/components/MovieCard";
import { useMovies } from "@/context/MovieContext";

export default function ComingSoon() {
  const { comingSoonList } = useMovies();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-cine-red uppercase">
          Next on Screen
        </p>
        <h1 className="mt-2 font-display text-5xl font-black text-cine-white">
          COMING SOON
        </h1>
        {comingSoonList.length === 0 ? (
          <div className="mt-16 text-center py-12 rounded-xl border border-white/5 bg-cine-card/40">
            <p className="text-cine-text text-sm">No upcoming movies currently scheduled.</p>
            <p className="text-xs text-cine-text/50 mt-1">Check back soon for new announcements!</p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {comingSoonList.map((movie) => (
              <MovieCard key={movie.id} movie={movie} variant="poster" isComingSoon />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
