import { useEffect, useRef, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Lock,
  MapPin,
  Pause,
  PlusCircle,
  Tag,
  Upload,
  Wallet,
  X,
} from "lucide-react";
import { nowShowing, nowShowingGrid } from "@/data/movies";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Movie } from "@/data/movies";
import type { GridMovie } from "@/data/movies";
import { useNotifications } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { useMovies } from "@/context/MovieContext";

type MovieData = (Movie | GridMovie) & {
  synopsis?: string;
  rating?: string;
  runtime?: string;
  landscape?: string;
};

interface CheckoutState {
  date?: string;
  cinema?: string;
  hall?: string;
  format?: string;
  time?: string;
  seats?: string[];
  ticketCount?: number;
  subtotal?: number;
  serviceFee?: number;
  total?: number;
}

const SEAT_PRICE = 15.0;
const SERVICE_FEE_RATE = 0.078;

const HOLD_SECONDS = 9 * 60 + 44;

const PAYMENT_METHODS = [
  {
    id: "aba",
    name: "ABA Pay",
    modalTitle: "ABA Mobile",
    logoClass: "bg-white text-black",
    logoText: "ABA",
  },
  {
    id: "acleda",
    name: "ACLEDA",
    modalTitle: "ACLEDA Mobile",
    logoClass: "bg-[#1B4FA0] text-white",
    logoText: "ACLEDA",
  },
  {
    id: "wing",
    name: "Wing",
    modalTitle: "Wing Mobile",
    logoClass: "bg-[#14A44D] text-white",
    logoText: "Wing",
  },
];

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface AppliedPromo {
  code: string;
  label: string;
  discountAmount: number;
  discountPercent?: number;
}

function evaluatePromoCode(code: string, currentSubtotal: number): AppliedPromo | null {
  const clean = code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
  if (!clean) return null;

  if (clean.includes("STUDENT")) {
    const discountAmount = Number((currentSubtotal * 0.4).toFixed(2));
    return {
      code: clean,
      label: "Student Special (40% Off)",
      discountAmount,
      discountPercent: 40,
    };
  }

  if (clean.includes("BOGO") || clean.includes("POPCORN")) {
    const discountAmount = Math.min(3.50, currentSubtotal);
    return {
      code: clean,
      label: "BOGO Popcorn Box Perk (-$3.50)",
      discountAmount,
    };
  }

  if (clean.includes("COMBO") || clean.includes("FEAST") || clean.includes("SNACK")) {
    const discountAmount = Math.min(5.00, currentSubtotal);
    return {
      code: clean,
      label: "Signature Feast Combo (-$5.00)",
      discountAmount,
    };
  }

  if (clean.includes("NIGHT") || clean.includes("OWL")) {
    const discountAmount = Number((currentSubtotal * 0.3).toFixed(2));
    return {
      code: clean,
      label: "Night Owl Special (30% Off)",
      discountAmount,
      discountPercent: 30,
    };
  }

  if (clean.length >= 3) {
    const discountAmount = Number((currentSubtotal * 0.2).toFixed(2));
    return {
      code: clean,
      label: "Exclusive Offer Discount (20% Off)",
      discountAmount,
      discountPercent: 20,
    };
  }

  return null;
}

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const locationState = useLocation().state as CheckoutState | null;

  const [secondsLeft, setSecondsLeft] = useState(HOLD_SECONDS);
  const [activeProvider, setActiveProvider] =
    useState<(typeof PAYMENT_METHODS)[number] | null>(null);
  const [modalStep, setModalStep] = useState<"qr" | "upload">("qr");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] =
    useState<(typeof PAYMENT_METHODS)[number] | null>(null);
  const [paid, setPaid] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoMessage, setPromoMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { addNotification, addToBookingHistory } = useNotifications();
  const { user } = useAuth();
  const { getMovieById } = useMovies();

  const seats = locationState?.seats ?? [];
  const ticketCount = locationState?.ticketCount ?? seats.length;
  const subtotal = locationState?.subtotal ?? ticketCount * SEAT_PRICE;
  const serviceFee = locationState?.serviceFee ?? subtotal * SERVICE_FEE_RATE;

  // Auto-detect claimed activePromo in localStorage
  useEffect(() => {
    try {
      const activePromo = localStorage.getItem("activePromo");
      if (activePromo && activePromo.trim()) {
        const res = evaluatePromoCode(activePromo, subtotal);
        if (res) {
          setAppliedPromo(res);
          setPromoCodeInput(activePromo.toUpperCase());
          setShowPromoInput(true);
          setPromoMessage({
            type: "success",
            text: `Offer ${res.code} applied! Saved $${res.discountAmount.toFixed(2)}.`,
          });
        }
      }
    } catch {}
  }, [subtotal]);

  const discount = appliedPromo ? Math.min(appliedPromo.discountAmount, subtotal) : 0;
  const finalSubtotal = Math.max(0, subtotal - discount);
  const total = Number((finalSubtotal + serviceFee).toFixed(2));

  const handleApplyPromo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPromoMessage(null);
    const result = evaluatePromoCode(promoCodeInput, subtotal);
    if (result) {
      setAppliedPromo(result);
      try {
        localStorage.setItem("activePromo", result.code);
      } catch {}
      setPromoMessage({
        type: "success",
        text: `Promo ${result.code} applied! Saved $${result.discountAmount.toFixed(2)}.`,
      });
    } else {
      setPromoMessage({
        type: "error",
        text: "Invalid promo code. Please enter a valid offer voucher.",
      });
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput("");
    setPromoMessage(null);
    try {
      localStorage.removeItem("activePromo");
    } catch {}
  };

  useEffect(() => {
    if (!proofFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(proofFile);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [proofFile]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const movie: MovieData | undefined =
    getMovieById(id || "") ||
    nowShowing.find((m) => m.id === id) ||
    nowShowingGrid.find((m) => m.id === id);

  const dateLabel = locationState?.date || "Today";
  const timeLabel = locationState?.time || "18:30";
  const cinemaLabel = locationState?.cinema || "CineStar Downtown";
  const hallLabel = locationState?.hall;
  const formatLabel = locationState?.format || "IMAX 2D";
  const formatPill = formatLabel.split(/\s+/)[0] || "IMAX";
  const genrePill = movie?.genre
    ? movie.genre.split("/")[0].trim().toUpperCase()
    : "ACTION";

  const proofSubmitted = selectedMethod !== null;

  function openModal(method: (typeof PAYMENT_METHODS)[number]) {
    setActiveProvider(method);
    setModalStep("qr");
    setProofFile(null);
  }

  function closeModal() {
    setActiveProvider(null);
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-cine-bg">
        <Header />
        <main className="flex items-center justify-center py-32">
          <div className="text-center">
            <p className="text-lg text-cine-text">Movie not found</p>
            <Link
              to="/movies"
              className="mt-4 inline-block rounded bg-cine-red px-6 py-2 text-sm font-bold text-white"
            >
              Back to Movies
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (paid) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-cine-bg px-4 py-12 text-center">
        <Link
          to="/"
          aria-label="Close and go home"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-cine-border bg-cine-card text-cine-text transition-colors hover:border-cine-red hover:text-cine-white"
        >
          <X size={18} />
        </Link>
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-cine-red shadow-[0_0_40px_rgba(228,22,42,0.55)]">
          <Check size={38} strokeWidth={3} className="text-white" />
        </div>
        <h1 className="mt-8 font-display text-3xl font-black tracking-tight text-cine-white [text-shadow:0_0_18px_rgba(228,22,42,0.6)] md:text-4xl">
          Payment Successful!
        </h1>
        <p className="mt-3 max-w-md text-sm text-cine-text">
          Your ticket reservation has been confirmed and registered to your active profile account.
        </p>

        {confirmedBookingId && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-cine-red/30 bg-cine-red/10 px-4 py-1 text-xs font-mono font-bold text-cine-red">
            <span>Booking #{confirmedBookingId.replace(/^#/, '')}</span>
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {confirmedBookingId && (
            <Link
              to={`/ticket/${confirmedBookingId}`}
              className="rounded-full bg-cine-red px-8 py-3 text-sm font-bold text-white shadow-[0_0_24px_rgba(228,22,42,0.4)] transition-all hover:bg-cine-red/90"
            >
              View My Ticket
            </Link>
          )}
          <Link
            to="/profile"
            className="rounded-full border border-cine-border bg-cine-card px-8 py-3 text-sm font-bold text-cine-white transition-colors hover:border-cine-red hover:bg-cine-card-hover"
          >
            Go to Profile
          </Link>
          <Link
            to="/"
            className="rounded-full border border-transparent px-5 py-3 text-sm font-semibold text-cine-text transition-colors hover:text-cine-white"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cine-bg">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Link
          to={`/select-seat/${id}`}
          className="inline-flex items-center gap-2 text-cine-red transition-opacity hover:opacity-80"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          <span className="text-[11px] font-bold uppercase tracking-[0.25em]">
            Checkout Journey
          </span>
        </Link>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tight text-cine-white [text-shadow:0_0_18px_rgba(228,22,42,0.6)] md:text-5xl">
          Review &amp; Pay
        </h1>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-cine-border bg-cine-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
              <div className="flex gap-4">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="h-20 w-14 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-cine-card-hover px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cine-text">
                      {genrePill}
                    </span>
                    <span className="rounded-full bg-cine-card-hover px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cine-text">
                      {formatPill}
                    </span>
                  </div>
                  <h2 className="mt-2 text-base font-bold text-cine-white">
                    {movie.title}
                  </h2>
                  <div className="mt-1 flex items-center gap-2 text-xs text-cine-text flex-wrap">
                    <p className="flex items-center gap-1">
                      <MapPin size={12} className="shrink-0 text-cine-red" />
                      <span className="truncate text-cine-white font-medium">{cinemaLabel}</span>
                    </p>
                    {hallLabel && (
                      <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                        {hallLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3 border-t border-cine-border pt-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-cine-text">Date &amp; Time</span>
                  <span className="text-xs font-bold text-cine-white">
                    {dateLabel}, {timeLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-cine-text">Seats</span>
                  <span className="text-xs font-bold text-cine-white">
                    {seats.length > 0 ? seats.join(", ") : "—"}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-3 border-t border-cine-border pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-cine-text">
                    Standard Ticket (x{ticketCount})
                  </span>
                  <span className="text-xs font-bold text-cine-white">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {appliedPromo && discount > 0 && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                      <Tag size={12} />
                      <span>{appliedPromo.label}</span>
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      - ${discount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-cine-text">
                    Internet Service Fee
                  </span>
                  <span className="text-xs font-bold text-cine-white">
                    ${serviceFee.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-cine-border pt-4">
                <div>
                  <span className="text-sm font-bold text-cine-white">Total</span>
                  {appliedPromo && discount > 0 && (
                    <span className="ml-2 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                      SAVED ${discount.toFixed(2)}
                    </span>
                  )}
                </div>
                <span className="text-xl font-black text-cine-red [text-shadow:0_0_14px_rgba(228,22,42,0.5)]">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-cine-border bg-cine-card p-5 shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cine-red shadow-[0_0_16px_rgba(228,22,42,0.5)]">
                <Pause size={16} className="fill-white text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-400">
                  Holding Seats For
                </p>
                <p className="mt-0.5 text-2xl font-black tabular-nums text-cine-white">
                  {formatTime(secondsLeft)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-cine-border bg-cine-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text">
              Select Payment Method
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedMethod?.id === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => openModal(method)}
                    className={`flex flex-col items-center gap-3 rounded-xl border p-4 transition-all ${
                      isSelected
                        ? "border-cine-red bg-cine-card-hover shadow-[0_0_16px_rgba(228,22,42,0.35)]"
                        : "border-cine-border bg-cine-card-hover hover:border-cine-red/60"
                    }`}
                  >
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-lg text-[10px] font-black ${method.logoClass}`}
                    >
                      {method.logoText}
                    </span>
                    <span className="text-[11px] font-semibold text-cine-white">
                      {method.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Promo Code / Voucher Box */}
            {!showPromoInput && !appliedPromo ? (
              <button
                type="button"
                onClick={() => setShowPromoInput(true)}
                className="mt-5 flex items-center gap-1.5 text-xs font-medium text-cine-red transition-opacity hover:opacity-80"
              >
                <PlusCircle size={13} />
                <span>Have a promo code or gift card?</span>
              </button>
            ) : (
              <div className="mt-5 rounded-xl border border-cine-border bg-black/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                    <Tag size={13} className="text-cine-red" />
                    <span>Offer / Promo Voucher</span>
                  </span>
                  {!appliedPromo && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowPromoInput(false);
                        setPromoMessage(null);
                      }}
                      className="text-zinc-500 hover:text-zinc-300 text-xs font-mono"
                    >
                      Close
                    </button>
                  )}
                </div>

                {appliedPromo ? (
                  <div className="flex items-center justify-between rounded-lg bg-emerald-950/40 border border-emerald-500/40 p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Check size={14} className="text-emerald-400" />
                        <span className="font-mono text-xs font-black text-emerald-300">
                          {appliedPromo.code}
                        </span>
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-300">
                          SAVED ${discount.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-400/90 truncate mt-0.5">
                        {appliedPromo.label}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="shrink-0 text-xs text-zinc-400 hover:text-white underline ml-3 font-mono"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. STUDENT40, BOGOPOPCORN"
                      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-xs text-white uppercase placeholder:text-zinc-600 focus:border-cine-red focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!promoCodeInput.trim()}
                      className="rounded-lg bg-cine-red px-4 py-2 font-mono text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 transition"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {promoMessage && (
                  <p
                    className={`text-[11px] font-medium ${
                      promoMessage.type === "success" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {promoMessage.text}
                  </p>
                )}
              </div>
            )}

            {conflictError && (
              <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                <p className="font-bold">Booking Conflict:</p>
                <p className="mt-1">{conflictError}</p>
                <Link
                  to={`/select-seat/${id}`}
                  className="mt-2 inline-block font-semibold text-cine-red underline"
                >
                  Return to seat selection
                </Link>
              </div>
            )}

            <button
              disabled={!proofSubmitted || isSubmitting}
              onClick={async () => {
                if (isSubmitting) return;
                setIsSubmitting(true);
                setConflictError(null);

                const bookingPayload = {
                  userId: user?.id || (user as any)?.email || "cust-guest",
                  customerName: user?.name || (user as any)?.email || "Customer",
                  movieTitle: movie.title,
                  screeningId: id || "sc-001",
                  screeningDate: dateLabel,
                  screeningTime: timeLabel,
                  seats: seats,
                  totalPrice: Number(total.toFixed(2)),
                  paymentMethod: selectedMethod?.name || activeProvider?.name || "ABA Pay",
                  status: "confirmed",
                };

                let createdBookingId = `BK-${Date.now().toString().slice(-6)}`;

                try {
                  const res = await fetch("http://localhost:5000/api/bookings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(bookingPayload),
                  });

                  if (res.status === 409) {
                    const errData = await res.json().catch(() => ({}));
                    const conflictMsg =
                      errData.message ||
                      "Selected seat(s) were just booked by another customer. Please select different seats.";
                    setConflictError(conflictMsg);
                    setIsSubmitting(false);
                    return;
                  }

                  if (res.ok) {
                    const savedData = await res.json().catch(() => ({}));
                    if (savedData?.id) {
                      createdBookingId = savedData.id;
                    }
                  }
                } catch (err) {
                  console.warn("Failed to persist booking to MySQL backend:", err);
                }

                setConfirmedBookingId(createdBookingId);
                setPaid(true);
                setIsSubmitting(false);

                const nowMs = Date.now();
                const promoSuffix = appliedPromo ? ` (Promo: ${appliedPromo.code})` : "";
                addNotification({
                  id: `booking-${createdBookingId}`,
                  title: "Booking Confirmed",
                  description: `Your tickets for "${movie.title}" (booked just now) have been confirmed. Showtime: ${dateLabel} at ${timeLabel}. Seats: ${
                    seats.length > 0 ? seats.join(", ") : "—"
                  }. Total: $${total.toFixed(2)}${promoSuffix}.`,
                  category: "Bookings",
                  badge: "TICKET CONFIRMED",
                  iconType: "ticket",
                  link: `/ticket/${createdBookingId}`,
                  bookingId: createdBookingId,
                  createdAt: nowMs,
                  movieTitle: movie.title,
                  seats,
                  total,
                  showtimeDate: dateLabel,
                  showtimeTime: timeLabel,
                });
                addToBookingHistory({
                  id: createdBookingId,
                  movieTitle: movie.title,
                  poster: movie.poster,
                  cinema: cinemaLabel,
                  date: dateLabel,
                  time: timeLabel,
                  seats,
                  ticketCount,
                  total,
                  paymentMethod: selectedMethod?.name || "ABA Pay",
                  createdAt: nowMs,
                  bookedAt: "Just now",
                });
              }}
              className={`mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white transition-all ${
                proofSubmitted && !isSubmitting
                  ? "bg-gradient-to-b from-[#E4162A] to-[#9C0F1F] shadow-[0_0_24px_rgba(228,22,42,0.45)] hover:shadow-[0_0_32px_rgba(228,22,42,0.6)]"
                  : "cursor-not-allowed bg-cine-red/40"
              }`}
            >
              {isSubmitting ? (
                <span>Processing Payment...</span>
              ) : proofSubmitted ? (
                <>
                  <Wallet size={15} />
                  <span>Process to Payment</span>
                </>
              ) : (
                <>
                  <Lock size={15} />
                  <span>Select a Payment Method Above</span>
                </>
              )}
            </button>

            <p className="mt-3 text-center text-[10px] text-cine-text/70">
              Your transaction is secured with 256-bit SSL encryption.
            </p>
          </div>
        </div>
      </main>

      {activeProvider && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-cine-border bg-cine-card p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              aria-label="Close"
              className="absolute right-4 top-4 text-cine-text transition-colors hover:text-cine-white"
            >
              <X size={18} />
            </button>

            {modalStep === "qr" ? (
              <>
                <h3 className="text-center text-lg font-black text-cine-white">
                  {activeProvider.modalTitle}
                </h3>
                <p className="mt-1 text-center text-xs text-cine-text">
                  Scan the QR code below to pay
                </p>
                <div className="mx-auto mt-5 w-52 rounded-lg bg-white p-1.5">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=CineStar-${activeProvider.id}-${total.toFixed(2)}`}
                    alt={`${activeProvider.name} payment QR code`}
                    className="w-full rounded"
                  />
                </div>
                <div className="mt-5 border-t border-cine-border pt-4 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text">
                    Amount to Pay
                  </p>
                  <p className="mt-1 text-3xl font-black text-cine-red [text-shadow:0_0_16px_rgba(228,22,42,0.5)]">
                    ${total.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => setModalStep("upload")}
                  className="mt-5 w-full rounded-xl bg-cine-red py-3 text-sm font-bold text-white transition-colors hover:bg-cine-red/90"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <h3 className="text-center text-lg font-black text-cine-white">
                  Upload Proof of Payment
                </h3>
                <p className="mt-1 text-center text-xs text-cine-text">
                  {activeProvider.name} &bull; ${total.toFixed(2)}
                </p>
                <label
                  className="relative mt-5 flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-cine-border bg-cine-bg p-4 text-center transition-colors hover:border-cine-red/60"
                >
                  {previewUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={previewUrl}
                        alt="Proof of payment preview"
                        className="max-h-48 w-auto rounded-lg object-contain shadow-md"
                      />
                      <span className="text-xs font-medium text-cine-text hover:text-cine-white">
                        Click to change image
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="text-cine-red" />
                      <span className="text-sm font-semibold text-cine-white">
                        Upload proof of payment
                      </span>
                      <span className="text-[11px] text-cine-text">
                        Upload your payment screenshot
                      </span>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setProofFile(e.target.files?.[0] ?? null)
                    }
                  />
                </label>
                {proofFile && (
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-cine-text-light">
                    <Check size={14} className="text-cine-red" />
                    {proofFile.name}
                  </p>
                )}
                <button
                  disabled={!proofFile}
                  onClick={() => {
                    setSelectedMethod(activeProvider);
                    closeModal();
                  }}
                  className={`mt-5 w-full rounded-xl py-3 text-sm font-bold text-white transition-all ${
                    proofFile
                      ? "bg-gradient-to-b from-[#E4162A] to-[#9C0F1F] shadow-[0_0_20px_rgba(228,22,42,0.4)]"
                      : "cursor-not-allowed bg-cine-red/40"
                  }`}
                >
                  Submit Proof
                </button>
              </>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
