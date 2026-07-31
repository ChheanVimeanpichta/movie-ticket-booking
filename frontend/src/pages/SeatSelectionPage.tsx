import { useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { MapPin, Clock, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { nowShowing, nowShowingGrid } from "@/data/movies";
import type { Movie } from "@/data/movies";
import type { GridMovie } from "@/data/movies";

type MovieData = (Movie | GridMovie) & { synopsis?: string; rating?: string; runtime?: string; landscape?: string };

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

const SEAT_COLUMNS = [
  { group: "left", seats: [1, 2, 3, 4] },
  { group: "center", seats: [5, 6, 7, 8, 9, 10] },
  { group: "right", seats: [11, 12, 13, 14] },
];

function generateReserved(): Set<string> {
  const reserved = new Set<string>();
  const reservedPositions = [
    "A1", "A4", "C2", "C3", "D5", "D6", "D10",
    "F3", "F8", "G1", "G4", "G7", "H9", "H12",
  ];
  reservedPositions.forEach((s) => reserved.add(s));
  return reserved;
}

const RESERVED = generateReserved();

const SEAT_PRICE = 15.00;
const SERVICE_FEE_RATE = 0.078;

export default function SeatSelectionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const locationState = useLocation().state as {
    date?: string;
    cinema?: string;
    format?: string;
    time?: string;
  } | null;

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const movie: MovieData | undefined =
    nowShowing.find((m) => m.id === id) ||
    nowShowingGrid.find((m) => m.id === id);

  if (!movie) {
    return (
      <div className="min-h-screen bg-cine-bg">
        <Header />
        <main className="flex items-center justify-center py-32">
          <p className="text-lg text-cine-text">Movie not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  function toggleSeat(seatId: string) {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  }

  const ticketCount = selectedSeats.length;
  const subtotal = ticketCount * SEAT_PRICE;
  const serviceFee = subtotal * SERVICE_FEE_RATE;
  const total = subtotal + serviceFee;

  const formatLabel = locationState?.format || "IMAX 2D";
  const timeLabel = locationState?.time || "8:30 PM";
  const cinemaLabel = locationState?.cinema || "Hall 4, IMAX";
  const dateLabel = locationState?.date || "Today";

  return (
    <div className="min-h-screen bg-cine-bg">
      <Header />
      <main className="pb-16">
        <div className="mx-auto max-w-7xl px-4 pt-6">
          <Link
            to={`/select-screen/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-cine-text transition-colors hover:text-cine-white"
          >
            <ArrowLeft size={14} />
            Back to Screen Selection
          </Link>
        </div>

        <div className="mx-auto mt-6 max-w-7xl px-4">
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1">
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h1 className="text-2xl font-black text-cine-white md:text-3xl">
                    {movie.title}
                  </h1>
                  <div className="mt-1 flex items-center gap-2 text-xs text-cine-text">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {cinemaLabel}
                    </span>
                    <span className="text-cine-border">&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {timeLabel}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="rounded-md border border-cine-border bg-cine-card px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-cine-white">
                    {formatLabel}
                  </span>
                  <span className="rounded-md border border-cine-border bg-cine-card px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-cine-white">
                    ENGLISH
                  </span>
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center">
                <div className="relative mb-10 w-full max-w-lg">
                  <div className="mx-auto h-1 w-4/5 rounded-full bg-gradient-to-r from-transparent via-cine-red/80 to-transparent shadow-lg shadow-cine-red/40" />
                  <div className="mx-auto mt-1 h-0.5 w-3/5 rounded-full bg-gradient-to-r from-transparent via-cine-red/50 to-transparent" />
                  <p className="mt-3 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-cine-text">
                    SCREEN
                  </p>
                </div>

                <div className="w-full max-w-lg">
                  {ROWS.map((row) => (
                    <div key={row} className="mb-2 flex items-center justify-center gap-1.5">
                      <span className="w-4 text-right text-[10px] font-bold text-cine-text">
                        {row}
                      </span>
                      {SEAT_COLUMNS.map((group, gi) => (
                        <div key={gi} className="flex gap-1.5">
                          {gi > 0 && <span className="w-3" />}
                          {group.seats.map((seatNum) => {
                            const seatId = `${row}${seatNum}`;
                            const isReserved = RESERVED.has(seatId);
                            const isSelected = selectedSeats.includes(seatId);
                            return (
                              <button
                                key={seatId}
                                disabled={isReserved}
                                onClick={() => toggleSeat(seatId)}
                                className={`flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold transition-all ${
                                  isReserved
                                    ? "cursor-not-allowed bg-[#1a1a22] text-cine-text/30"
                                    : isSelected
                                      ? "bg-cine-red text-white shadow-sm shadow-cine-red/40"
                                      : "bg-[#24242e] text-cine-white hover:bg-cine-red/30 hover:text-white"
                                }`}
                              >
                                {seatNum}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                      <span className="w-4 text-left text-[10px] font-bold text-cine-text">
                        {row}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3.5 w-3.5 rounded-sm bg-[#24242e] border border-cine-border" />
                    <span className="text-[11px] text-cine-text">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3.5 w-3.5 rounded-sm bg-cine-red" />
                    <span className="text-[11px] text-cine-text">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3.5 w-3.5 rounded-sm bg-[#1a1a22]" />
                    <span className="text-[11px] text-cine-text">Reserved</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full shrink-0 lg:w-80">
              <div className="sticky top-24 overflow-hidden rounded-xl bg-cine-card">
                <div className="aspect-[2/3] w-full overflow-hidden">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-cine-white">
                    {movie.title}
                  </h3>
                  <p className="mt-1 text-xs text-cine-text">
                    {formatLabel} &bull; {cinemaLabel} &bull; {dateLabel}, {timeLabel}
                  </p>

                  <div className="mt-4 space-y-3 border-t border-cine-border pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-cine-text">
                        Selected Seats
                      </span>
                      {selectedSeats.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {(() => {
                            const grouped: Record<string, string[]> = {};
                            selectedSeats.forEach((s) => {
                              const row = s[0];
                              const num = s.slice(1);
                              if (!grouped[row]) grouped[row] = [];
                              grouped[row].push(num);
                            });
                            return Object.entries(grouped).map(
                              ([row, nums]) => (
                                <span
                                  key={row}
                                  className="text-[11px] font-semibold text-cine-red"
                                >
                                  {row}: {nums.join(", ")}
                                </span>
                              )
                            );
                          })()}
                        </div>
                      ) : (
                        <span className="text-[11px] text-cine-text/50">
                          None selected
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-cine-text">
                        Tickets ({ticketCount})
                      </span>
                      <span className="text-xs font-semibold text-cine-white">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-cine-text">
                        Service Fees
                      </span>
                      <span className="text-xs font-semibold text-cine-white">
                        ${serviceFee.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-cine-border pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-cine-text">
                          TOTAL AMOUNT
                        </span>
                        <p className="mt-0.5 text-xl font-black text-cine-white">
                          ${total.toFixed(2)}
                        </p>
                      </div>
                      <span className="mt-1 rounded bg-cine-card-hover px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-cine-text">
                        GST INCLUDED
                      </span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      disabled={selectedSeats.length === 0}
                      onClick={() =>
                        navigate(`/checkout/${id}`, {
                          state: {
                            date: dateLabel,
                            cinema: cinemaLabel,
                            format: formatLabel,
                            time: timeLabel,
                            seats: selectedSeats,
                            ticketCount,
                            subtotal,
                            serviceFee,
                            total,
                          },
                        })
                      }
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all ${
                        selectedSeats.length === 0
                          ? "cursor-not-allowed bg-cine-red/50"
                          : "bg-cine-red shadow-lg shadow-cine-red/30 hover:bg-cine-red/90"
                      }`}
                    >
                      Proceed to Checkout &rarr;
                    </button>
                    <p className="mt-3 text-center text-[10px] text-cine-text/60">
                      Cancellation available up to 2 hours before showtime
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
