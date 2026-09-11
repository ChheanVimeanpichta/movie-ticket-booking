import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface OfferBullet {
  icon: string;
  text: string;
}

interface OfferDetailData {
  id: string;
  image: string;
  title: string;
  publishDate: string;
  intro: string;
  bullets: OfferBullet[];
}

const OFFER_DETAILS: Record<string, OfferDetailData> = {
  "bogo-popcorn": {
    id: "bogo-popcorn",
    image:
      "https://tse2.mm.bing.net/th/id/OIP.DPQLRl96UnrsL1iMMOWGSgHaJQ?r=0&w=700&h=875&rs=1&pid=ImgDetMain&o=7&rm=3",
    title: "Buy 1 Get 1 FREE! 🍿🎉",
    publishDate: "Aug 04, 2026",
    intro:
      "Enjoy our special Buy 1 Get 1 FREE offer on Large Popcorn Box, exclusively on Foodpanda! 😍",
    bullets: [
      { icon: "✨", text: "Get 2 Large Popcorn Boxes for only $3.50." },
      { icon: "🗓️", text: "Promotion period: 1–15 August 2026." },
      {
        icon: "📱",
        text: "Order now on Foodpanda and enjoy the delicious, freshly popped popcorn! 🍿💛",
      },
    ],
  },
  "combo-deal": {
    id: "combo-deal",
    image: "https://m.media-amazon.com/images/I/71Jwq+AaNmL._SL1500_.jpg",
    title: "Snack Combo — $8.50 🥤🍗",
    publishDate: "Aug 04, 2026",
    intro: "Fuel up before the lights go down with our signature snack combo.",
    bullets: [
      { icon: "✨", text: "1x Large popcorn, 1x crunchy tenders, 2x soft drinks." },
      { icon: "🗓️", text: "Available every day, in-cinema only." },
      { icon: "🎬", text: "Show this offer at the concessions counter to redeem." },
    ],
  },
  "student-special": {
    id: "student-special",
    image:
      "https://i.pinimg.com/736x/b4/2b/ef/b42bef7ed6fe12ca729d1dbd0ca0590d.jpg",
    title: "Happy days for enjoying movies! 🎓",
    publishDate: "Aug 04, 2026",
    intro:
      "Back to the big screen. Enjoy 40% off all standard tickets and a complimentary small popcorn with any valid student ID.",
    bullets: [
      { icon: "✨", text: "Valid Monday through Thursday." },
      { icon: "🎓", text: "A valid student ID is required at the cinema." },
      { icon: "🍿", text: "Complimentary small butter popcorn included with any valid student ticket." },
    ],
  },
  "movie-night-deal": {
    id: "movie-night-deal",
    image: "https://m.media-amazon.com/images/I/81F7FAqTakL._AC_.jpg",
    title: "Enjoy a movie night with special pricing! 🎬",
    publishDate: "Aug 04, 2026",
    intro: "Make it a night out with friends or family at a price that's easy to say yes to.",
    bullets: [
      { icon: "✨", text: "Discounted standard tickets on select nights." },
      { icon: "🗓️", text: "Check showtimes for eligible screenings." },
    ],
  },
  "movie-night-combo": {
    id: "movie-night-combo",
    image:
      "https://i.pinimg.com/736x/c2/90/85/c2908591164ebc5e588855bb521ab466.jpg",
    title: "Enjoy a movie with combo meals! 🎬",
    publishDate: "Aug 04, 2026",
    intro: "Pair your ticket with a full combo meal, all bundled into one easy price.",
    bullets: [
      { icon: "✨", text: "1x ticket, 1x popcorn, 1x drink in a single bundle." },
      { icon: "🎬", text: "Available for any standard screening." },
    ],
  },
  "movie-night-popcorn": {
    id: "movie-night-popcorn",
    image:
      "https://tse4.mm.bing.net/th/id/OIP.M4_ooM3tSc6oEeYED_TZvAHaJQ?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    title: "Enjoy a movie with popcorn! 🎬",
    publishDate: "Aug 04, 2026",
    intro: "Every great movie night starts with a fresh, warm box of popcorn.",
    bullets: [
      { icon: "✨", text: "Add a large popcorn to any ticket at a discounted price." },
      { icon: "🗓️", text: "Valid every day, while supplies last." },
    ],
  },
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function OfferDetail() {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();

  const [offer, setOffer] = useState<OfferDetailData | undefined>(() =>
    offerId && OFFER_DETAILS[offerId] ? OFFER_DETAILS[offerId] : undefined
  );
  const [allOffers, setAllOffers] = useState<OfferDetailData[]>(() =>
    Object.values(OFFER_DETAILS)
  );
  const [isLoading, setIsLoading] = useState(!offer);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchOfferData = async () => {
      try {
        if (!offer) {
          setIsLoading(true);
        }
        const noCacheHeaders = {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        };
        const [singleRes, allRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/offers/${encodeURIComponent(offerId || "")}?_t=${Date.now()}`, {
            cache: "no-store",
            headers: noCacheHeaders,
          }),
          fetch(`${API_BASE_URL}/offers?_t=${Date.now()}`, {
            cache: "no-store",
            headers: noCacheHeaders,
          }),
        ]);

        if (singleRes.status === "fulfilled" && singleRes.value.ok) {
          const item = await singleRes.value.json();
          if (item && isMounted) {
            const parsedBullets: OfferBullet[] = Array.isArray(item.bullets)
              ? item.bullets.map((b: any) =>
                  typeof b === "string"
                    ? { icon: "✨", text: b }
                    : { icon: b.icon || "✨", text: b.text || "" }
                )
              : [];

            setOffer({
              id: item.id,
              image: item.image,
              title: item.title,
              publishDate: item.publishDate || "Active Promotion",
              intro: item.description,
              bullets: parsedBullets,
            });
          }
        }

        if (allRes.status === "fulfilled" && allRes.value.ok) {
          const list = await allRes.value.json();
          if (Array.isArray(list) && isMounted) {
            const mapped: OfferDetailData[] = list.map((item: any) => ({
              id: item.id,
              image: item.image,
              title: item.title,
              publishDate: item.publishDate || "Active Promotion",
              intro: item.description,
              bullets: Array.isArray(item.bullets)
                ? item.bullets.map((b: any) =>
                    typeof b === "string"
                      ? { icon: "✨", text: b }
                      : { icon: b.icon || "✨", text: b.text || "" }
                  )
                : [],
            }));
            setAllOffers(mapped);
          }
        }
      } catch (err) {
        console.warn("Could not fetch offer details from backend, using fallback:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (offerId) {
      fetchOfferData();
    }

    // 1. Real-time Server-Sent Events (SSE) connection: updates in 0ms when admin changes anything
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`${API_BASE_URL}/offers/stream`);
      eventSource.onmessage = () => {
        fetchOfferData();
      };
    } catch {}

    // 2. Auto-polling every 2 seconds for real-time synchronization
    const interval = setInterval(fetchOfferData, 2000);

    // 3. Focus listener: immediately update when user returns to this tab
    const onFocus = () => {
      fetchOfferData();
    };

    // 4. Storage event: triggers instant sync across browser tabs when admin updates an offer
    const onStorage = (e: StorageEvent) => {
      if (e.key === "cinestar_offers_updated") {
        fetchOfferData();
      }
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    window.addEventListener("cinestar:offers-updated", fetchOfferData);

    return () => {
      isMounted = false;
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cinestar:offers-updated", fetchOfferData);
    };
  }, [offerId]);

  // Filter out the active offer from the bottom recommendation grid
  const otherOffers = allOffers.filter(
    (item) => item.id !== offerId
  );

  const visibleOffers = showAll ? otherOffers : otherOffers.slice(0, 3);

  if (isLoading && !offer) {
    return (
      <main className="relative min-h-screen bg-black text-white flex flex-col justify-between">
        <Header />
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cine-red border-t-transparent mb-4" />
          <p className="text-sm text-zinc-400 font-mono tracking-wider uppercase">Loading promotion...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!offer) {
    return (
      <main className="relative min-h-screen bg-black text-white flex flex-col justify-between">
        <Header />
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <p className="mb-4 text-xl font-bold text-white">Offer not found</p>
          <Link
            to="/offers"
            className="inline-flex items-center gap-2 rounded-full bg-[#d31926] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#b0131e]"
          >
            <ArrowLeft size={16} />
            Back to Offers
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-cine-red selection:text-white flex flex-col justify-between">
      {/* Ambient warm background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-cine-red/15 blur-[140px]" />
        <div className="absolute top-[40rem] -right-20 h-96 w-96 rounded-full bg-cine-pink/10 blur-[150px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/85" />
      </div>

      <div className="relative">
        <Header />

        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
          {/* Top navigation row */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate("/offers")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
            >
              <ArrowLeft size={16} />
              Back to Offers
            </button>

            <nav className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
              <Link to="/" className="hover:text-zinc-200 transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link to="/offers" className="hover:text-zinc-200 transition-colors">
                Promotions
              </Link>
              <span>/</span>
              <span className="font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                {offer.title}
              </span>
            </nav>
          </div>

          {/* ===================== MAIN OFFER DETAIL SHOWCASE BOX ===================== */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#161616] via-[#101010] to-[#0a0a0a] p-6 sm:p-8 lg:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
            {/* Subtle ambient lighting inside box */}
            <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-cine-red/15 blur-[90px]" />

            {/* Header row inside box */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cine-red/10 border border-cine-red/30 px-3 py-1 text-xs font-semibold text-cine-pink tracking-wide">
                  <Sparkles size={12} className="text-cine-red" />
                  CINEMA EXCLUSIVE
                </span>
                <span className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                  <Calendar size={13} className="text-zinc-500" />
                  Publish Date: {offer.publishDate}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {offer.title}
              </h1>
            </div>

            {/* Banner Image Frame */}
            <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
              <img
                src={offer.image}
                alt={offer.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Intro & Overview text */}
            <div className="mb-8">
              <h2 className="text-base sm:text-lg font-bold text-white mb-2">
                About This Promotion
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-zinc-300 font-body">
                {offer.intro}
              </p>
            </div>

            {/* Perks & Details Grid */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
                What's Included:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {offer.bullets.map((bullet, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3.5 rounded-2xl border border-white/5 bg-black/40 p-4 transition-colors hover:border-white/15 hover:bg-black/60"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cine-red/15 text-lg border border-cine-red/25">
                      {bullet.icon}
                    </span>
                    <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed pt-1 font-body">
                      {bullet.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtle bottom note */}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2.5 text-xs text-zinc-400">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>
                Available across all Cinestar theater locations. Simply mention or show this promotion at the cinema.
              </span>
            </div>
          </div>

          {/* Divider */}
          <hr className="my-14 border-white/10" />

          {/* ===================== OTHER OFFERS SECTION ===================== */}
          <section className="pb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Other Offers You Might Like
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                  Explore other current ticket discounts and concessions bundles.
                </p>
              </div>

              <Link
                to="/offers"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-cine-pink hover:text-white transition-colors"
              >
                View All
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Recommendation Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {visibleOffers.map((item) => (
                <Link
                  key={item.id}
                  to={`/offers/${item.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-[#121212] p-3 border border-white/5 transition-all duration-300 hover:border-white/20 hover:bg-[#1a1a1a] hover:-translate-y-1 shadow-md"
                >
                  {/* Inner Image Frame */}
                  <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-black">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Card Title Label */}
                  <div className="px-1 pt-3 pb-1 flex items-center justify-between gap-2">
                    <p className="truncate text-xs sm:text-sm font-bold text-white group-hover:text-cine-pink transition-colors">
                      {item.title}
                    </p>
                    <ArrowRight
                      size={14}
                      className="text-zinc-500 shrink-0 transition-transform group-hover:text-white group-hover:translate-x-0.5"
                    />
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
                  className="rounded-full bg-[#d31926] px-8 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#b0131e] active:scale-95 shadow-lg hover:shadow-cine-red/25"
                >
                  See More
                </button>
              </div>
            )}
          </section>
        </div>

        <Footer />
      </div>
    </main>
  );
}