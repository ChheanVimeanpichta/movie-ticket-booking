import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MovieCard from "@/components/MovieCard";
import { comingSoon } from "@/data/movies";

export default function ComingSoon() {
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
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {comingSoon.map((movie) => (
            <MovieCard key={movie.id} movie={movie} variant="landscape" />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
