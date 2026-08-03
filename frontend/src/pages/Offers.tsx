import React from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const WEEKDAY_DEALS = [
  { label: "STANDARD", value: "Buy 1 Get 1" },
  { label: "IMAX", value: "25% OFF" },
];

export default function Offers() {
  return (
    <main className="min-h-screen bg-cine-black text-cine-white">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden h-80 border border-cine-border bg-cine-card">
            <img
              src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80"
              alt="Friends at CineStar Lounge with popcorn"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
            <div className="relative flex h-full flex-col justify-end p-6">
              <span className="mb-3 w-fit rounded bg-cine-red px-3 py-1 text-xs font-bold tracking-wide">
                STUDENT SPECIAL
              </span>
              <h3 className="mb-1 text-xl font-bold">Back to the Big Screen</h3>
              <p className="mb-4 max-w-md text-sm text-cine-white/70 font-body">
                Enjoy 40% off all standard tickets and a complimentary small
                popcorn with any valid student ID. Valid Monday through
                Thursday.
              </p>
              
              <Link
                to="/claim-offer"
                className="w-fit rounded-md bg-cine-red px-5 py-2.5 text-sm font-bold tracking-wide transition hover:bg-cine-red/90 inline-block text-white"
              >
                CLAIM OFFER
              </Link>
            </div>
          </div>

          <div className="relative h-80 overflow-hidden rounded-2xl border border-cine-border bg-cine-card p-6">
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80"
              alt="Hand holding CineStar Elite card"
              className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
            <div className="relative z-10 flex h-full flex-col justify-end">
              <p className="mb-1 text-xs font-bold tracking-widest text-cine-red">
                CINESTAR ELITE
              </p>
              <h3 className="mb-2 text-lg font-bold">Loyalty Rewards</h3>
              <p className="mb-5 text-sm text-cine-white/60 font-body">
                Earn 5 points for every dollar spent. Redeem for free tickets,
                IMAX upgrades, and private screenings.
              </p>
              <button className="w-full rounded-md border border-cine-border py-2.5 text-sm font-bold tracking-wide transition hover:border-cine-red hover:text-cine-red">
                JOIN PROGRAM
              </button>
            </div>
          </div>
        </div>

        {/* Weekday Special Section */}
        <div className="rounded-2xl border border-cine-border bg-cine-card p-6">
          <div className="mb-5 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cine-red">
              <Calendar className="h-5 w-5 text-cine-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Weekday Special</h3>
              <p className="text-xs tracking-wide text-cine-white/40">
                TUE &amp; WED ONLY
              </p>
            </div>
          </div>
          <p className="mb-6 max-w-2xl text-sm text-cine-white/60 font-body">
            Beat the mid-week blues with 2-for-1 tickets on all standard
            screenings before 6:00 PM. Perfect for a post-work escape.
          </p>
          
          {/* Deals Grid with BOOK NOW Buttons */}
          <div className="grid max-w-xl grid-cols-1 sm:grid-cols-2 gap-4">
            {WEEKDAY_DEALS.map((deal) => (
              <div
                key={deal.label}
                className="flex flex-col justify-between rounded-xl border border-cine-border bg-cine-white/5 p-4 transition hover:border-cine-red/50"
              >
                <div className="mb-4">
                  <p className="mb-1 text-[11px] font-bold tracking-widest text-cine-white/40 uppercase">
                    {deal.label}
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      deal.label === "IMAX" ? "text-cine-red" : "text-cine-white"
                    }`}
                  >
                    {deal.value}
                  </p>
                </div>

                <Link
                  to={`/movies?type=${deal.label.toLowerCase()}`}
                  className="w-full text-center rounded-lg bg-cine-red px-4 py-2.5 text-xs font-bold tracking-wider text-white transition hover:bg-cine-red/90"
                >
                  BOOK NOW
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}