// src/pages/ClaimOffer.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ClaimOffer() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    studentId: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Generate a unique discount code
    const generatedCode = `STUDENT40-${Math.floor(1000 + Math.random() * 9000)}`;
    setPromoCode(generatedCode);

    // 2. (Optional) Save to localStorage so checkout can auto-apply it
    localStorage.setItem("activePromo", generatedCode);

    // 3. Show success view
    setIsSubmitted(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Header />

      <section className="flex-grow flex items-center justify-center py-16 px-6">
        <div className="w-full max-w-xl">
          {!isSubmitted ? (
            <>
              <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold tracking-tighter text-cine-red">
                  Claim Your Offer
                </h1>
                <p className="mt-3 text-zinc-400 text-base max-w-md mx-auto">
                  You're moments away from unlocking your curated{" "}
                  <span className="font-semibold text-white">Student Special</span> reward.
                </p>
              </div>

              <div className="rounded-3xl border border-cine-red/20 bg-zinc-900/50 backdrop-blur-xl p-8 sm:p-10 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-400">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-sm text-white placeholder:text-zinc-600 transition focus:border-cine-red focus:ring-2 focus:ring-cine-red/50 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-400">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@university.edu"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-sm text-white placeholder:text-zinc-600 transition focus:border-cine-red focus:ring-2 focus:ring-cine-red/50 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-400">
                      Student ID Number
                    </label>
                    <input
                      type="text"
                      name="studentId"
                      required
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="e.g., STU-123456"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-sm text-white placeholder:text-zinc-600 transition focus:border-cine-red focus:ring-2 focus:ring-cine-red/50 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-8 rounded-xl bg-cine-red py-4 text-sm font-bold tracking-wider transition hover:bg-cine-red/90 hover:shadow-[0_0_20px_rgba(229,9,20,0.5)] active:scale-[0.98]"
                  >
                    CLAIM OFFER NOW
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* --- SUCCESS VIEW AFTER CLAIMING --- */
            <div className="rounded-3xl border border-green-500/30 bg-zinc-900/80 backdrop-blur-xl p-8 sm:p-10 text-center shadow-2xl space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-400 text-3xl font-bold">
                ✓
              </div>

              <div>
                <h2 className="text-3xl font-extrabold text-white">Congratulations!</h2>
                <p className="mt-2 text-zinc-400 text-sm">
                  Here is your exclusive student discount promo code:
                </p>
              </div>

              {/* Promo Code Box */}
              <div className="flex items-center justify-between rounded-xl border border-zinc-700 bg-black p-4">
                <span className="font-mono text-xl font-bold tracking-widest text-cine-red">
                  {promoCode}
                </span>
                <button
                  onClick={handleCopy}
                  className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-bold text-white transition hover:bg-zinc-700"
                >
                  {copied ? "COPIED!" : "COPY CODE"}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-3">
                <Link
                  to="/movies"
                  className="block w-full rounded-xl bg-cine-red py-4 text-sm font-bold tracking-wider transition hover:bg-cine-red/90 hover:shadow-[0_0_20px_rgba(229,9,20,0.5)]"
                >
                  BROWSE MOVIES & BOOK NOW
                </Link>

                <button
                  onClick={() => setIsSubmitted(false)}
                  className="block w-full text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Back to offer form
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}