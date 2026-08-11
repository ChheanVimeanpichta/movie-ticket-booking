import React from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const OFFERS = [
  {
    id: "bogo-popcorn",
    image:
      "https://tse2.mm.bing.net/th/id/OIP.DPQLRl96UnrsL1iMMOWGSgHaJQ?r=0&w=700&h=875&rs=1&pid=ImgDetMain&o=7&rm=3",
    icon: "🍿",
    caption: "Buy 1 Get 1 FREE! 🎉",
  },
  {
    id: "combo-deal",
    image: "https://m.media-amazon.com/images/I/71Jwq+AaNmL._SL1500_.jpg",
    icon: "🥤",
    caption: "Snack Combo — $8.50 🍗",
  },
  {
    id: "student-special",
    image:
      "https://i.pinimg.com/736x/b4/2b/ef/b42bef7ed6fe12ca729d1dbd0ca0590d.jpg",
    icon: "🎓",
    caption: "Happy days for enjoying movies!",
  },
  {
    id: "movie-night-deal",
    image: "https://m.media-amazon.com/images/I/81F7FAqTakL._AC_.jpg",
    icon: "🎬",
    caption: "Enjoy a movie night with special pricing!",
  },
  {
    id: "movie-night-combo",
    image:
      "https://i.pinimg.com/736x/c2/90/85/c2908591164ebc5e588855bb521ab466.jpg",
    icon: "🎬",
    caption: "Enjoy a movie with combo meals!",
  },
  {
    id: "movie-night-popcorn",
    image:
      "https://tse4.mm.bing.net/th/id/OIP.M4_ooM3tSc6oEeYED_TZvAHaJQ?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    icon: "🍿",
    caption: "Enjoy a movie with popcorn!",
  },
];

export default function Offers() {
  return (
    <main className="relative min-h-screen bg-black text-cine-white">
      {/* Soft warm vignette glow at the top, clipped to its own layer so it doesn't break sticky positioning below */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-cine-red/15 blur-[140px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
      </div>

      <div className="relative">
        <Header />
        <section className="mx-auto max-w-7xl px-6 py-14">
        {/* Hero */}
        <div className="border-l-2 border-cine-red/60 pl-6 mb-10">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
            Exclusive <span className="text-cine-red">Promotions</span>
          </h1>
          <p className="mt-3 text-cine-white/50 max-w-xl text-sm sm:text-base font-body">
            Elevate your cinematic experience with our premium curated offers.
            From family gatherings to late-night student premieres, find the
            perfect deal for your next visit.
          </p>
        </div>

        {/* Offer feed */}
        <h2 className="mb-4 text-xl font-bold">What we offer</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OFFERS.map((offer) => (
            <Link
              key={offer.id}
              to={`/offers/${offer.id}`}
              className="block rounded-2xl border border-cine-border bg-cine-card p-3 transition hover:border-cine-red/50 hover:shadow-lg"
            >
              <div className="h-40 w-full overflow-hidden rounded-xl sm:h-48">
                <img
                  src={offer.image}
                  alt={offer.caption}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex items-start gap-2 pt-3">
                <span className="text-base leading-none">{offer.icon}</span>
                <p className="text-sm font-bold leading-snug">{offer.caption}</p>
              </div>
            </Link>
          ))}
        </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}