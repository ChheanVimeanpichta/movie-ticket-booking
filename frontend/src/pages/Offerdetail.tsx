// src/pages/OfferDetail.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Copy, Check, Ticket, Tag, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getOffers, getOfferById, getCachedOffers, OfferItem, DEFAULT_OFFERS } from "@/services/offerService";

function getOfferPromoCode(id: string): string {
  const clean = id.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (clean.includes("STUDENT")) return "STUDENT40";
  if (clean.includes("BOGO")) return "BOGOPOPCORN";
  if (clean.includes("COMBO")) return "SNACKFEAST";
  if (clean.includes("NIGHT")) return "NIGHTOWL30";
  return `CINE-${clean.slice(0, 8) || "DEAL2026"}`;
}

export default function OfferDetail() {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();

  const [offer, setOffer] = useState<OfferItem | null>(() => {
    if (!offerId) return null;
    const cached = getCachedOffers();
    return (
      cached.find(
        (o) => o.id === offerId || o.id.toLowerCase() === offerId.toLowerCase()
      ) ||
      DEFAULT_OFFERS.find(
        (o) => o.id === offerId || o.id.toLowerCase() === offerId.toLowerCase()
      ) ||
      null
    );
  });

  const [allOffers, setAllOffers] = useState<OfferItem[]>(() => getCachedOffers());
  const [loading, setLoading] = useState<boolean>(!offer);
  const [showAll, setShowAll] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

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
          if (foundOffer) {
            setOffer(foundOffer);
          } else {
            // Check fallback from offersList or DEFAULT_OFFERS
            const fallback =
              offersList.find(
                (o) => o.id === offerId || o.id.toLowerCase() === offerId.toLowerCase()
              ) ||
              DEFAULT_OFFERS.find(
                (o) => o.id === offerId || o.id.toLowerCase() === offerId.toLowerCase()
              ) ||
              null;
            if (fallback) setOffer(fallback);
          }
          if (offersList && offersList.length > 0) {
            setAllOffers(offersList);
          }
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

  const promoCode = offer ? getOfferPromoCode(offer.id) : "CINESTAR2026";

  const handleCopyCode = () => {
    try {
      navigator.clipboard.writeText(promoCode);
      setCopiedCode(true);
      localStorage.setItem("activePromo", promoCode);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  // Filter out the active offer from the bottom recommendation grid
  const otherOffers = allOffers.filter(
    (item) => item.id.toLowerCase() !== (offerId || "").toLowerCase()
  );

  const visibleOffers = showAll ? otherOffers : otherOffers.slice(0, 3);

  const isStudentOffer =
    offer?.id.toLowerCase().includes("student") ||
    offer?.title.toLowerCase().includes("student");

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-black text-white">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <Loader2 className="animate-spin text-cine-red mb-3" size={36} />
          <p className="text-sm font-medium text-white/60 font-body">Loading offer details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="flex min-h-screen flex-col bg-black text-white">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 max-w-md shadow-2xl">
            <Tag size={40} className="mx-auto mb-3 text-cine-red" />
            <h2 className="text-xl font-bold text-white">Offer Not Found</h2>
            <p className="mt-2 text-sm text-zinc-400">
              The requested promotion is either expired or unavailable. Explore our other exclusive deals!
            </p>
            <div className="mt-6">
              <Link
                to="/offers"
                className="inline-flex items-center gap-2 rounded-xl bg-cine-red px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white hover:bg-red-700 transition"
              >
                <ArrowLeft size={14} />
                <span>Browse All Offers</span>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Top thin reddish-orange gradient accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-[#f95738] to-red-600" />

      <Header />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <button
          type="button"
          onClick={() => navigate("/offers")}
          className="mb-5 inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-white/70 transition hover:text-white"
        >
          <ArrowLeft size={15} />
          <span>Back to Offers</span>
        </button>

        {/* Breadcrumbs */}
        <p className="mb-3 text-xs text-zinc-400 font-mono">
          <Link to="/offers" className="hover:text-white transition-colors">
            Promotions
          </Link>{" "}
          / <span className="font-bold text-zinc-200">{offer.title}</span>
        </p>

        {/* Main Header */}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-black leading-tight sm:text-3xl text-white">
            {offer.title}
          </h1>
          {offer.badge && (
            <span className="rounded-full bg-cine-red/20 border border-cine-red/40 px-3 py-0.5 text-[11px] font-bold text-red-400">
              {offer.badge}
            </span>
          )}
        </div>

        <p className="mt-1.5 mb-6 text-xs text-zinc-400 font-mono">
          Publish Date: {offer.publishDate} &bull; Validity: {offer.validity || "Limited Time"}
        </p>

        {/* Main Banner */}
        <div className="mb-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
          <img
            src={offer.image}
            alt={offer.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80";
            }}
          />
        </div>

        {/* Details Text & Bullets */}
        <div className="rounded-2xl border border-zinc-800/80 bg-[#121214] p-6 sm:p-8 shadow-xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles size={18} className="text-[#f95738]" />
            <span>Promotion Details</span>
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300 font-body">
            {offer.intro}
          </p>

          <div className="mt-6 border-t border-zinc-800/80 pt-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-3">
              What&apos;s Included &amp; Terms
            </h3>
            <ul className="space-y-3">
              {((offer.bullets && offer.bullets.length > 0)
                ? offer.bullets
                : (offer.perks && offer.perks.length > 0)
                ? offer.perks.map((p) => ({ icon: "✨", text: p }))
                : [
                    { icon: "✨", text: "Special promotion available for all CineStar guests." },
                    { icon: "🗓️", text: "Valid during standard theater operating hours." },
                  ]
              ).map((bullet, i) => {
                const icon = typeof bullet === "string" ? "✨" : bullet?.icon || "✨";
                const text = typeof bullet === "string" ? bullet : bullet?.text || String(bullet || "");
                return (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm leading-relaxed text-zinc-300"
                  >
                    <span className="shrink-0 text-base">{icon}</span>
                    <span>{text}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Action / Claim Section */}
          <div className="mt-8 rounded-xl border border-[#f95738]/30 bg-gradient-to-r from-orange-950/20 via-zinc-900 to-black p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#f95738]">
                  Exclusive Promo Code
                </p>
                <div className="mt-1.5 flex items-center gap-3">
                  <span className="rounded-lg bg-black/80 border border-zinc-700 px-3.5 py-1.5 font-mono text-sm font-black tracking-widest text-white shadow-inner">
                    {promoCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-mono font-medium text-zinc-200 hover:text-white hover:border-[#f95738] transition-colors"
                  >
                    {copiedCode ? (
                      <>
                        <Check size={13} className="text-green-400" />
                        <span className="text-green-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">
                  Apply at checkout or present at the cinema counter to redeem.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
                {isStudentOffer ? (
                  <Link
                    to="/claim-offer"
                    onClick={() => {
                      try {
                        localStorage.setItem("activePromo", promoCode);
                      } catch {}
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-[#f95738] px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/50 hover:opacity-90 transition-all"
                  >
                    <Tag size={14} />
                    <span>Claim 40% Discount</span>
                  </Link>
                ) : (
                  <Link
                    to="/movies"
                    onClick={() => {
                      try {
                        localStorage.setItem("activePromo", promoCode);
                      } catch {}
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-[#f95738] px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/50 hover:opacity-90 transition-all"
                  >
                    <Ticket size={14} />
                    <span>Book With Offer</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-12 border-zinc-800" />

        {/* Recommendation Grid */}
        <section className="pb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-4 w-1 rounded bg-cine-red" />
              <span>More Exclusive Promotions</span>
            </h2>
            <Link to="/offers" className="text-xs font-mono font-semibold text-cine-red hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {visibleOffers.map((item) => (
              <Link
                key={item.id}
                to={`/offers/${item.id}`}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-[#121214] p-2.5 transition hover:border-[#f95738]/50 hover:shadow-lg"
              >
                {/* Inner Image Frame */}
                <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-black">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                </div>

                {/* Card Title Label */}
                <div className="px-1 pt-3 pb-1">
                  <p className="truncate text-xs font-bold text-white group-hover:text-[#f95738] transition-colors">
                    {item.title}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-zinc-400">
                    {item.caption || item.intro}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Centered Button */}
          {!showAll && otherOffers.length > 3 && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="rounded-full border border-zinc-700 bg-zinc-900 px-7 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-200 transition hover:bg-zinc-800 hover:text-white"
              >
                See More Offers
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
