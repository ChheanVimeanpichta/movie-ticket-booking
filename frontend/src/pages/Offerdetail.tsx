// src/pages/OfferDetail.tsx
import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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
      { icon: "🎓", text: "A valid student ID is required at claim and at the cinema." },
      { icon: "📩", text: "Submit your details to receive a unique promo code." },
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

export default function OfferDetail() {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const offer = offerId ? OFFER_DETAILS[offerId] : undefined;

  const [showAll, setShowAll] = useState(false);

  // Filter out the active offer from the bottom recommendation grid
  const otherOffers = Object.values(OFFER_DETAILS).filter(
    (item) => item.id !== offerId
  );

  const visibleOffers = showAll ? otherOffers : otherOffers.slice(0, 3);

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