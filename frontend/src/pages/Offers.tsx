import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getOffers, subscribeOfferUpdates, OfferItem, DEFAULT_OFFERS } from "@/services/offerService";

export default function Offers() {
  const [offers, setOffers] = useState<OfferItem[]>(DEFAULT_OFFERS);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadOffers() {
      try {
        const data = await getOffers();
        if (isMounted) {
          setOffers(data);
          setLoading(false);
        }
      } catch {
        if (isMounted) setLoading(false);
      }
    }

    loadOffers();

    // Subscribe to live SSE updates when admin updates offers
    const unsubscribe = subscribeOfferUpdates(() => {
      loadOffers();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);
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
          {offers.map((offer) => (
            <Link
              key={offer.id}
              to={`/offers/${offer.id}`}
              className="group block rounded-2xl border border-cine-border bg-cine-card p-3 transition hover:border-cine-red/50 hover:shadow-lg relative overflow-hidden"
            >
              <div className="relative h-40 w-full overflow-hidden rounded-xl sm:h-48 bg-black/40">
                <img
                  src={offer.image}
                  alt={offer.caption || offer.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                {offer.tag && (
                  <span className="absolute top-2.5 right-2.5 rounded-full bg-cine-red px-2.5 py-0.5 text-[11px] font-bold text-white shadow">
                    {offer.tag}
                  </span>
                )}
                {offer.badge && (
                  <span className="absolute bottom-2.5 left-2.5 rounded bg-black/75 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-white/90">
                    {offer.badge}
                  </span>
                )}
              </div>
              <div className="flex items-start gap-2 pt-3">
                <span className="text-base leading-none">{offer.icon}</span>
                <p className="text-sm font-bold leading-snug text-cine-white group-hover:text-cine-red transition-colors">
                  {offer.caption || offer.title}
                </p>
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