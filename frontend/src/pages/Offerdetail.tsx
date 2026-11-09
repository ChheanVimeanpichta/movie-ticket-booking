// src/pages/OfferDetail.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getOffers, getOfferById, OfferItem, DEFAULT_OFFERS } from "@/services/offerService";

export default function OfferDetail() {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();

  const [offer, setOffer] = useState<OfferItem | null>(() => {
    if (!offerId) return null;
    return DEFAULT_OFFERS.find((o) => o.id === offerId) || null;
  });
  const [allOffers, setAllOffers] = useState<OfferItem[]>(DEFAULT_OFFERS);
  const [loading, setLoading] = useState<boolean>(!offer);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!offerId) return;
      try {
        const [foundOffer, offersList] = await Promise.all([
          getOfferById(offerId),
          getOffers(),
        ]);
        if (isMounted) {
          setOffer(foundOffer);
          setAllOffers(offersList);
          setLoading(false);
        }
      } catch {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [offerId]);

  // Filter out the active offer from the bottom recommendation grid
  const otherOffers = allOffers.filter(
    (item) => item.id !== offerId
  );

  const visibleOffers = showAll ? otherOffers : otherOffers.slice(0, 3);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
        <Loader2 className="animate-spin text-cine-red mb-3" size={32} />
        <p className="text-sm text-white/60">Loading offer details...</p>
      </main>
    );
  }

  if (!offer) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
        <p className="mb-4 text-lg font-bold">Offer not found</p>
        <Link to="/offers" className="text-sm font-semibold text-red-600">
          Back to offers
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-14">
        {/* Back navigation */}
        <button
          type="button"
          onClick={() => navigate("/offers")}
          className="mb-4 flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Offers
        </button>

        {/* Breadcrumbs */}
        <p className="mb-3 text-sm text-white/50">
          <Link to="/offers" className="hover:text-white/80">
            Promotions
          </Link>{" "}
          / <span className="font-bold text-white">{offer.title}</span>
        </p>

        {/* Main Header */}
        <h1 className="mb-1 text-2xl font-black leading-tight sm:text-3xl">
          {offer.title}
        </h1>
        <p className="mb-5 text-xs text-white/40">
          Publish Date: {offer.publishDate}
        </p>

        {/* Main Banner */}
        <div className="mb-8 aspect-[16/9] w-full overflow-hidden rounded-2xl">
          <img
            src={offer.image}
            alt={offer.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Details Text */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">{offer.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-white/80">
              {offer.intro}
            </p>
          </div>

          <ul className="space-y-3 pt-2">
            {offer.bullets.map((bullet, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm leading-relaxed text-white/70"
              >
                <span className="shrink-0 text-base">{bullet.icon}</span>
                <span>{bullet.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <hr className="my-12 border-white/10" />

        {/* Grid matching your exact reference image */}
        <section className="pb-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {visibleOffers.map((item) => (
              <Link
                key={item.id}
                to={`/offers/${item.id}`}
                className="group flex flex-col overflow-hidden rounded-xl bg-[#121212] p-2 transition hover:bg-[#1c1c1c]"
              >
                {/* Inner Image Frame */}
                <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-black">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Card Title Label */}
                <div className="px-1 pt-3 pb-1">
                  <p className="truncate text-xs font-bold text-white sm:text-sm">
                    {item.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Centered Red Button */}
          {!showAll && otherOffers.length > 3 && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="rounded-full bg-[#d31926] px-8 py-2.5 text-sm font-bold text-white transition hover:bg-[#b0131e] active:scale-95"
              >
                See More
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}