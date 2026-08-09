import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  ScanLine,
  CheckCircle2,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNotifications } from "@/context/NotificationContext";

const SAMPLE_BOOKINGS = [
  {
    id: "sample-1",
    title: "The Batman",
    poster: "https://picsum.photos/seed/batman-poster/400/600",
    badge: "IMAX 3D",
    badgeOutlined: false,
    date: "Friday, Oct 25",
    time: "7:30 PM",
    cinema: "Grand Vista",
    seats: ["Row H, Seat 12", "Row H, Seat 13"],
    ticketCount: 2,
    total: 28,
  },
  {
    id: "sample-2",
    title: "Void Runner",
    poster: "https://picsum.photos/seed/void-poster/400/600",
    badge: "STANDARD",
    badgeOutlined: true,
    date: "Saturday, Oct 26",
    time: "9:00 PM",
    cinema: "Grand Vista",
    seats: ["Row D, Seat 4", "Row D, Seat 5"],
    ticketCount: 2,
    total: 24,
  },
];

export default function TicketPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { bookingHistory } = useNotifications();

  const realBooking = bookingHistory.find((b) => b.id === id);
  const sampleBooking = SAMPLE_BOOKINGS.find((b) => b.id === id);

  const booking = realBooking
    ? {
        id: realBooking.id,
        title: realBooking.movieTitle,
        poster: realBooking.poster || "https://picsum.photos/seed/poster/400/600",
        badge: "CONFIRMED",
        badgeOutlined: false,
        date: realBooking.date,
        time: realBooking.time,
        cinema: realBooking.cinema,
        seats: realBooking.seats.length > 0 ? realBooking.seats : ["—"],
        ticketCount: realBooking.ticketCount,
        total: realBooking.total,
      }
    : sampleBooking;

  if (!booking) {
    return (
      <div className="min-h-screen bg-cine-bg">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <Ticket size={40} className="mx-auto text-cine-text" />
          <h1 className="mt-4 text-2xl font-black text-cine-white">Ticket Not Found</h1>
          <p className="mt-2 text-sm text-cine-text">
            We couldn't find this ticket. It may have been removed.
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-cine-red px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-cine-red/80"
          >
            <ArrowLeft size={15} />
            Back to Profile
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const refCode = `CS-${booking.id.toUpperCase().replace(/[^A-Z0-9]/g, "")}`;
  const hall = "Hall 4";
  const qrData = `CineStar|${booking.title}|${booking.cinema}|${booking.date}|${booking.time}|${booking.seats.join("+")}`;
  const barcode = booking.id
    .split("")
    .map((c) => c.charCodeAt(0) % 4 + 2)
    .join("");

  return (
    <div className="min-h-screen bg-cine-bg">
      <div className="print:hidden">
        <Header />
      </div>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 print:max-w-none print:p-0">
        <button
          onClick={() => navigate(-1)}
          className="print:hidden inline-flex items-center gap-2 text-sm font-semibold text-cine-text transition-colors hover:text-cine-white"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="mt-6 text-center print:hidden">
          <p className="inline-flex items-center gap-2 rounded-full bg-cine-red/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-cine-red">
            <CheckCircle2 size={13} />
            Booking Confirmed
          </p>
          <h1 className="mt-3 font-display text-3xl font-black tracking-tight text-cine-white sm:text-4xl">
            YOUR TICKET
          </h1>
        </div>

        <div className="mt-8 print:mt-0">
          <div className="print-area relative rounded-3xl border border-cine-border bg-cine-card shadow-[0_20px_60px_rgba(0,0,0,0.55)] print:rounded-none print:border-gray-300 print:bg-white print:shadow-none print:text-black">
            {/* Ticket top */}
            <div className="flex gap-5 p-5 sm:p-6">
              <img
                src={booking.poster}
                alt={`${booking.title} poster`}
                className="h-40 w-28 shrink-0 rounded-xl border border-cine-border object-cover sm:h-44 sm:w-32"
              />
              <div className="min-w-0 flex-1">
                <span
                  className={`inline-block rounded px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider ${
                    booking.badgeOutlined
                      ? "border border-cine-border text-cine-text-light print:border-gray-400 print:text-gray-700"
                      : "bg-cine-red text-white"
                  }`}
                >
                  {booking.badge}
                </span>
                <h2 className="mt-2 text-xl font-black leading-tight text-cine-white sm:text-2xl print:text-black">
                  {booking.title}
                </h2>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-cine-text print:text-gray-600">
                  <MapPin size={14} className="shrink-0 text-cine-red" />
                  <span className="truncate">{booking.cinema}</span>
                  <span className="mx-1 text-cine-border print:text-gray-400">|</span>
                  <span className="shrink-0">{hall}</span>
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-cine-text-light print:text-gray-800">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-cine-red" />
                    {booking.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-cine-red" />
                    {booking.time}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {booking.seats.map((seat) => (
                    <span
                      key={seat}
                      className="rounded-md border border-cine-red/60 bg-cine-red/10 px-2 py-1 font-mono text-[11px] font-bold text-cine-red print:border-cine-red print:bg-white"
                    >
                      {seat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Perforation line */}
            <div className="relative flex items-center px-5 sm:px-6">
              <div className="h-6 w-6 -translate-x-10 rounded-full bg-cine-bg sm:-translate-x-11 print:bg-white" />
              <div className="h-px flex-1 border-t-2 border-dashed border-cine-border print:border-gray-300" />
              <div className="h-6 w-6 translate-x-10 rounded-full bg-cine-bg sm:translate-x-11 print:bg-white" />
            </div>

            {/* Ticket body */}
            <div className="flex flex-col gap-6 p-5 sm:p-6 md:flex-row md:items-center">
              <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text print:text-gray-600">
                    Tickets
                  </p>
                  <p className="mt-1 text-lg font-black text-cine-white print:text-black">
                    {booking.ticketCount}×
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text print:text-gray-600">
                    Amount Paid
                  </p>
                  <p className="mt-1 text-lg font-black text-cine-gold print:text-[#a16207]">
                    ${(booking.total ?? 0).toFixed(2)}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text print:text-gray-600">
                    Reference
                  </p>
                  <p className="mt-1 truncate font-mono text-sm font-bold text-cine-white print:text-black">
                    {refCode}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <div className="rounded-xl border border-cine-border bg-white p-1.5 print:border-gray-300">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}`}
                    alt="Ticket QR code"
                    className="h-24 w-24"
                  />
                </div>
                <div className="hidden sm:block">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-cine-text print:text-gray-600">
                    Scan at
                  </p>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-cine-text print:text-gray-600">
                    entrance
                  </p>
                  <ScanLine size={20} className="mt-2 text-cine-red" />
                </div>
              </div>
            </div>

            {/* Barcode strip */}
            <div className="border-t border-cine-border px-5 pb-5 pt-4 sm:px-6 print:border-gray-300">
              <div className="flex items-center justify-center gap-[3px]">
                {barcode.split("").map((n, i) => (
                  <span
                    key={i}
                    style={{ width: `${n}px` }}
                    className="block h-10 bg-cine-white print:bg-black"
                  />
                ))}
              </div>
              <p className="mt-3 text-center font-mono text-[10px] tracking-[0.35em] text-cine-text print:text-gray-600">
                {refCode}
              </p>
            </div>
          </div>

          <p className="mt-5 text-center text-xs leading-relaxed text-cine-text print:hidden">
            Present this ticket (printed or on your phone) at the entrance.
            <br className="hidden sm:block" /> Tickets are non-refundable and non-transferable.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row print:hidden">
            <button
              onClick={() => window.print()}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-cine-red py-3.5 text-sm font-bold text-white transition-all hover:bg-cine-red/80"
            >
              <Download size={16} />
              Download Ticket
            </button>
          </div>
        </div>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
