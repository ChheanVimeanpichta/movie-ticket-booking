import React from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Sparkles, ArrowRight, Calendar } from "lucide-react";

interface OfferItem {
  id: string;
  title: string;
  caption: string;
  badge: string;
  tag: string;
  image: string;
  icon: string;
  validity: string;
  description: string;
  perks: string[];
}

const OFFERS: OfferItem[] = [
  {
    id: "student-special",
    title: "Student Cinema Special",
    caption: "Happy days for enjoying movies! 🎓",
    badge: "STUDENT PERK",
    tag: "40% OFF",
    validity: "Valid Mon – Thu",
    image:
      "https://i.pinimg.com/736x/b4/2b/ef/b42bef7ed6fe12ca729d1dbd0ca0590d.jpg",
    icon: "🎓",
    description:
      "Back to the big screen! Enjoy 40% off standard tickets and a complimentary small popcorn with any valid student ID.",
    perks: [
      "40% off standard 2D & 3D tickets",
      "Free small butter popcorn included",
    ],
  },
  {
    id: "bogo-popcorn",
    title: "Buy 1 Get 1 FREE Popcorn",
    caption: "Buy 1 Get 1 FREE! 🎉",
    badge: "CONCESSION",
    tag: "BOGO FREE",
    validity: "Limited Time",
    image:
      "https://tse2.mm.bing.net/th/id/OIP.DPQLRl96UnrsL1iMMOWGSgHaJQ?r=0&w=700&h=875&rs=1&pid=ImgDetMain&o=7&rm=3",
    icon: "🍿",
    description:
      "Enjoy our special Buy 1 Get 1 FREE offer on Large Popcorn Boxes. Freshly popped cinema butter or sweet caramel.",
    perks: [
      "2 Large Popcorn Boxes for only $3.50",
      "Available in-cinema & Foodpanda",
    ],
  },
  {
    id: "combo-deal",
    title: "Signature Feast Snack Combo",
    caption: "Snack Combo — $8.50 🍗",
    badge: "SNACKS & DRINKS",
    tag: "$8.50 ONLY",
    validity: "Everyday In-Cinema",
    image: "https://m.media-amazon.com/images/I/71Jwq+AaNmL._SL1500_.jpg",
    icon: "🥤",
    description:
      "Fuel up before the lights go down with our signature snack combo available at all concession stands.",
    perks: [
      "1x Large popcorn & crunchy tenders",
      "2x Refreshing fountain drinks",
    ],
  },
  {
    id: "movie-night-deal",
    title: "Night Owl Movie Special",
    caption: "Enjoy a movie night with special pricing! 🎬",
    badge: "TICKET DEAL",
    tag: "UP TO 30% OFF",
    validity: "Select Screenings",
    image: "https://m.media-amazon.com/images/I/81F7FAqTakL._AC_.jpg",
    icon: "🎬",
    description:
      "Make it a night out with friends or family at special rates on prime evening screenings after 9:00 PM.",
    perks: [
      "Discounted standard tickets",
      "Eligible for prime evening showtimes",
    ],
  },
  {
    id: "movie-night-combo",
    title: "All-In-One Movie & Meal Ticket",
    caption: "Enjoy a movie with combo meals! 🎬",
    badge: "COMBO BUNDLE",
    tag: "SAVE $5.00",
    validity: "All Standard Shows",
    image:
      "https://i.pinimg.com/736x/c2/90/85/c2908591164ebc5e588855bb521ab466.jpg",
    icon: "🎬",
    description:
      "Pair your ticket directly with a delicious meal combo bundled into one easy transaction.",
    perks: [
      "1x Movie ticket + 1x popcorn + 1x soda",
      "All-in-one single bundled price",
    ],
  },
  {
    id: "movie-night-popcorn",
    title: "Cinema Popcorn Ticket Add-On",
    caption: "Enjoy a movie with popcorn! 🍿",
    badge: "ADD-ON PERK",
    tag: "$2.50 UPGRADE",
    validity: "Daily at Counter",
    image:
      "https://tse4.mm.bing.net/th/id/OIP.M4_ooM3tSc6oEeYED_TZvAHaJQ?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    icon: "🍿",
    description:
      "Every great movie deserves delicious cinema popcorn. Add a large popcorn to your ticket during booking or check-in.",
    perks: [
      "Add large popcorn to any ticket",
      "Choice of Sweet Caramel or Butter",
    ],
  },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function Offers() {
  const [offers, setOffers] = React.useState<OfferItem[]>(OFFERS);

  React.useEffect(() => {
    let isMounted = true;

    const fetchOffers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/offers?_t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && isMounted) {
            const mapped: OfferItem[] = data.map((item: any) => ({
              id: item.id,
              title: item.title,
              caption: item.caption || item.title,
              badge: item.badge || "SPECIAL DEAL",
              tag: item.tag || "OFFER",
              image: item.image,
              icon: item.icon || "🎬",
              validity: item.validity || "Limited Time",
              description: item.description,
              perks:
                Array.isArray(item.perks) && item.perks.length > 0
                  ? item.perks
                  : Array.isArray(item.bullets)
                  ? item.bullets.map((b: any) => (typeof b === "string" ? b : b.text))
                  : [],
            }));
            setOffers(mapped);
          }
        }
      } catch (err) {
        console.warn("Could not fetch offers from backend, using defaults:", err);
      }
    };

    fetchOffers();

    // 1. Real-time Server-Sent Events (SSE) connection: updates in 0ms when admin changes anything
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`${API_BASE_URL}/offers/stream`);
      eventSource.onmessage = () => {
        fetchOffers();
      };
    } catch {}

    // 2. Auto-polling interval every 2 seconds for continuous real-time sync
    const interval = setInterval(fetchOffers, 2000);

    // 3. Focus listener: immediately re-fetch whenever user switches back to this tab
    const onFocus = () => {
      fetchOffers();
    };

    // 4. Storage event: triggers instant sync across browser tabs when admin updates an offer
    const onStorage = (e: StorageEvent) => {
      if (e.key === "cinestar_offers_updated") {
        fetchOffers();
      }
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    window.addEventListener("cinestar:offers-updated", fetchOffers);

    return () => {
      isMounted = false;
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cinestar:offers-updated", fetchOffers);
    };
  }, []);
  return (
    <main className="relative min-h-screen bg-black text-cine-white selection:bg-cine-red selection:text-white">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-cine-red/15 blur-[140px]" />
        <div className="absolute top-[40rem] -right-20 h-96 w-96 rounded-full bg-cine-pink/10 blur-[150px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
      </div>

      <div className="relative">
        <Header />

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <div className="mb-12 border-l-2 border-cine-red/60 pl-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cine-red/10 border border-cine-red/30 px-3 py-0.5 text-xs font-semibold text-cine-pink tracking-wide">
                <Sparkles size={12} className="text-cine-red" />
                CINEMA PROMOTIONS
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight text-white">
              Exclusive <span className="text-cine-red">Promotions</span>
            </h1>
            <p className="mt-3 text-zinc-400 max-w-2xl text-sm sm:text-base font-body leading-relaxed">
              Elevate your cinematic experience with our curated cinema promotions.
              From student discounts and ticket bundles to delicious concession treats,
              explore all current offers available across our theaters.
            </p>
          </div>

          {/* All Offers Grid — Unified in one place */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <Link
                key={offer.id}
                to={`/offers/${offer.id}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-cine-border bg-gradient-to-b from-[#141414] to-[#0c0c0c] p-4 transition-all duration-300 hover:-translate-y-1.5 hover:border-cine-red/60 hover:shadow-[0_12px_30px_rgba(228,22,42,0.2)]"
              >
                <div>
                  {/* Image container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-black">
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                    {/* Top left badge */}
                    <span className="absolute top-3 left-3 rounded-md bg-black/75 backdrop-blur-md border border-white/15 px-2.5 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
                      {offer.badge}
                    </span>

                    {/* Top right tag */}
                    <span className="absolute top-3 right-3 rounded-md bg-cine-red px-2.5 py-1 text-[11px] font-black text-white shadow-md">
                      {offer.tag}
                    </span>

                    {/* Bottom validity pill */}
                    <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 rounded-lg bg-black/70 backdrop-blur-sm px-2.5 py-1 text-[11px] text-zinc-300 font-medium">
                      <Calendar size={12} className="text-cine-pink" />
                      <span>{offer.validity}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="pt-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cine-pink transition-colors line-clamp-1">
                        {offer.title}
                      </h3>
                      <span className="text-lg shrink-0" aria-hidden="true">
                        {offer.icon}
                      </span>
                    </div>

                    <p className="mt-2 text-xs sm:text-sm text-zinc-400 font-body leading-relaxed line-clamp-2">
                      {offer.description}
                    </p>

                    {/* Key Perks */}
                    <div className="mt-3.5 space-y-1.5 border-t border-white/5 pt-3">
                      {offer.perks.map((perk, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs text-zinc-300"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-cine-red shrink-0" />
                          <span className="truncate">{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer Button */}
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">
                    {offer.caption}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition-all group-hover:bg-cine-red group-hover:text-white">
                    View Details
                    <ArrowRight
                      size={13}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
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