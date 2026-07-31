import { useEffect, useRef, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Lock,
  MapPin,
  Pause,
  PlusCircle,
  Upload,
  Wallet,
  X,
} from "lucide-react";
import { nowShowing, nowShowingGrid } from "@/data/movies";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Movie } from "@/data/movies";
import type { GridMovie } from "@/data/movies";

type MovieData = (Movie | GridMovie) & {
  synopsis?: string;
  rating?: string;
  runtime?: string;
  landscape?: string;
};

interface CheckoutState {
  date?: string;
  cinema?: string;
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

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const locationState = useLocation().state as CheckoutState | null;

  const [secondsLeft, setSecondsLeft] = useState(HOLD_SECONDS);
  const [activeProvider, setActiveProvider] =
    useState<(typeof PAYMENT_METHODS)[number] | null>(null);
  const [modalStep, setModalStep] = useState<"qr" | "upload">("qr");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [selectedMethod, setSelectedMethod] =
    useState<(typeof PAYMENT_METHODS)[number] | null>(null);
  const [paid, setPaid] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const movie: MovieData | undefined =
    nowShowing.find((m) => m.id === id) ||
    nowShowingGrid.find((m) => m.id === id);

  const seats = locationState?.seats ?? [];
  const ticketCount = locationState?.ticketCount ?? seats.length;
  const subtotal = locationState?.subtotal ?? ticketCount * SEAT_PRICE;
  const serviceFee = locationState?.serviceFee ?? subtotal * SERVICE_FEE_RATE;
  const total = locationState?.total ?? subtotal + serviceFee;

  const dateLabel = locationState?.date || "Today";
  const timeLabel = locationState?.time || "8:30 PM";
  const cinemaLabel = locationState?.cinema || "CineStar Luxury Cinema, Hall 4";
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
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-cine-bg px-4">
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
        <p className="mt-3 text-sm text-cine-text">
          Your tickets have been sent to your email.
        </p>
        <Link
          to="/"
          className="mt-8 rounded-full border border-cine-border bg-cine-card px-8 py-3 text-sm font-bold text-cine-white transition-colors hover:border-cine-red hover:bg-cine-card-hover"
        >
          Back to Home
        </Link>
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
                  <p className="mt-1 flex items-center gap-1 text-xs text-cine-text">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{cinemaLabel}</span>
                  </p>
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
                <span className="text-sm font-bold text-cine-white">Total</span>
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

            <button className="mt-5 flex items-center gap-1.5 text-xs font-medium text-cine-red transition-opacity hover:opacity-80">
              <PlusCircle size={13} />
              Have a promo code or gift card?
            </button>

            <button
              disabled={!proofSubmitted}
              onClick={() => setPaid(true)}
              className={`mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white transition-all ${
                proofSubmitted
                  ? "bg-gradient-to-b from-[#E4162A] to-[#9C0F1F] shadow-[0_0_24px_rgba(228,22,42,0.45)] hover:shadow-[0_0_32px_rgba(228,22,42,0.6)]"
                  : "cursor-not-allowed bg-cine-red/40"
              }`}
            >
              {proofSubmitted ? <Wallet size={15} /> : <Lock size={15} />}
              {proofSubmitted ? "Process to Payment" : "Select a Payment Method Above"}
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
                  className="mt-5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-cine-border bg-cine-bg p-8 text-center transition-colors hover:border-cine-red/60"
                >
                  <Upload size={24} className="text-cine-red" />
                  <span className="text-sm font-semibold text-cine-white">
                    Upload proof of payment
                  </span>
                  <span className="text-[11px] text-cine-text">
                    Upload your payment screenshot
                  </span>
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
