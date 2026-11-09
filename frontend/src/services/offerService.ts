// src/services/offerService.ts
// Connects the movie-ticket-booking frontend to the Cinestar Admin backend Offers API

export interface OfferBullet {
  icon: string;
  text: string;
}

export interface OfferItem {
  id: string;
  title: string;
  caption: string;
  badge?: string;
  tag?: string;
  image: string;
  icon: string;
  validity?: string;
  intro: string;
  bullets: OfferBullet[];
  perks?: string[];
  publishDate: string;
  status?: string;
}

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:5000/api";

export const DEFAULT_OFFERS: OfferItem[] = [
  {
    id: "bogo-popcorn",
    image:
      "https://tse2.mm.bing.net/th/id/OIP.DPQLRl96UnrsL1iMMOWGSgHaJQ?r=0&w=700&h=875&rs=1&pid=ImgDetMain&o=7&rm=3",
    icon: "🍿",
    caption: "Buy 1 Get 1 FREE! 🎉",
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
    status: "Active",
  },
  {
    id: "combo-deal",
    image: "https://m.media-amazon.com/images/I/71Jwq+AaNmL._SL1500_.jpg",
    icon: "🥤",
    caption: "Snack Combo — $8.50 🍗",
    title: "Snack Combo — $8.50 🥤🍗",
    publishDate: "Aug 04, 2026",
    intro: "Fuel up before the lights go down with our signature snack combo.",
    bullets: [
      { icon: "✨", text: "1x Large popcorn, 1x crunchy tenders, 2x soft drinks." },
      { icon: "🗓️", text: "Available every day, in-cinema only." },
      { icon: "🎬", text: "Show this offer at the concessions counter to redeem." },
    ],
    status: "Active",
  },
  {
    id: "student-special",
    image:
      "https://i.pinimg.com/736x/b4/2b/ef/b42bef7ed6fe12ca729d1dbd0ca0590d.jpg",
    icon: "🎓",
    caption: "Happy days for enjoying movies!",
    title: "Happy days for enjoying movies! 🎓",
    publishDate: "Aug 04, 2026",
    intro:
      "Back to the big screen. Enjoy 40% off all standard tickets and a complimentary small popcorn with any valid student ID.",
    bullets: [
      { icon: "✨", text: "Valid Monday through Thursday." },
      { icon: "🎓", text: "A valid student ID is required at claim and at the cinema." },
      { icon: "📩", text: "Submit your details to receive a unique promo code." },
    ],
    status: "Active",
  },
  {
    id: "movie-night-deal",
    image: "https://m.media-amazon.com/images/I/81F7FAqTakL._AC_.jpg",
    icon: "🎬",
    caption: "Enjoy a movie night with special pricing!",
    title: "Enjoy a movie night with special pricing! 🎬",
    publishDate: "Aug 04, 2026",
    intro: "Make it a night out with friends or family at a price that's easy to say yes to.",
    bullets: [
      { icon: "✨", text: "Discounted standard tickets on select nights." },
      { icon: "🗓️", text: "Check showtimes for eligible screenings." },
    ],
    status: "Active",
  },
  {
    id: "movie-night-combo",
    image:
      "https://i.pinimg.com/736x/c2/90/85/c2908591164ebc5e588855bb521ab466.jpg",
    icon: "🎬",
    caption: "Enjoy a movie with combo meals!",
    title: "Enjoy a movie with combo meals! 🎬",
    publishDate: "Aug 04, 2026",
    intro: "Pair your ticket with a full combo meal, all bundled into one easy price.",
    bullets: [
      { icon: "✨", text: "1x ticket, 1x popcorn, 1x drink in a single bundle." },
      { icon: "🎬", text: "Available for any standard screening." },
    ],
    status: "Active",
  },
  {
    id: "movie-night-popcorn",
    image:
      "https://tse4.mm.bing.net/th/id/OIP.M4_ooM3tSc6oEeYED_TZvAHaJQ?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    icon: "🍿",
    caption: "Enjoy a movie with popcorn!",
    title: "Enjoy a movie with popcorn! 🎬",
    publishDate: "Aug 04, 2026",
    intro: "Every great movie night starts with a fresh, warm box of popcorn.",
    bullets: [
      { icon: "✨", text: "Add a large popcorn to any ticket at a discounted price." },
      { icon: "🗓️", text: "Valid every day, while supplies last." },
    ],
    status: "Active",
  },
];

let inMemoryOfferCache: OfferItem[] | null = null;

function normalizeBullets(raw: any, perks?: string[]): OfferBullet[] {
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((item: any) => {
      if (typeof item === "string") return { icon: "✨", text: item };
      return {
        icon: item?.icon || "✨",
        text: item?.text || String(item || ""),
      };
    });
  }
  if (Array.isArray(perks) && perks.length > 0) {
    return perks.map((p) => ({ icon: "✨", text: String(p) }));
  }
  return [
    { icon: "✨", text: "Exclusive promotion available for all CineStar guests." },
    { icon: "🗓️", text: "Valid during standard theater operating hours." },
  ];
}

function mapRawOffer(o: any): OfferItem {
  const title = o.title || o.caption || "Special Offer";
  const caption = o.caption || o.title || title;
  const intro = o.description || o.intro || caption;
  const image = o.image || "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80";
  const icon = o.icon || (caption.includes("🍿") || title.includes("Popcorn") ? "🍿" : caption.includes("🥤") ? "🥤" : caption.includes("🎓") ? "🎓" : "🎬");
  const publishDate =
    o.publishDate ||
    (o.createdAt
      ? new Date(o.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      : "Aug 04, 2026");

  return {
    id: String(o.id),
    title,
    caption,
    badge: o.badge,
    tag: o.tag,
    image,
    icon,
    validity: o.validity,
    intro,
    bullets: normalizeBullets(o.bullets, o.perks),
    perks: o.perks,
    publishDate,
    status: o.status || "Active",
  };
}

/**
 * Fetch all active offers from the Cinestar Admin backend.
 * Falls back gracefully to default offers if the network or backend is unreachable.
 */
export async function getOffers(): Promise<OfferItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/offers?_t=${Date.now()}`);
    if (!res.ok) {
      throw new Error(`Offers API returned status ${res.status}`);
    }
    const rawOffers = await res.json();
    if (Array.isArray(rawOffers) && rawOffers.length > 0) {
      const activeOffers = rawOffers
        .filter((o: any) => !o.status || o.status.toLowerCase() === "active")
        .map(mapRawOffer);

      if (activeOffers.length > 0) {
        inMemoryOfferCache = activeOffers;
        return activeOffers;
      }
    }
  } catch (err) {
    console.warn("[offerService] Could not fetch live offers from admin backend, using fallbacks:", err);
  }

  if (inMemoryOfferCache && inMemoryOfferCache.length > 0) {
    return inMemoryOfferCache;
  }
  return DEFAULT_OFFERS;
}

/**
 * Fetch a single offer by ID from the Cinestar Admin backend.
 */
export async function getOfferById(id: string): Promise<OfferItem | null> {
  // Check memory cache first
  if (inMemoryOfferCache) {
    const cached = inMemoryOfferCache.find((o) => o.id === id);
    if (cached) return cached;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/offers/${encodeURIComponent(id)}?_t=${Date.now()}`);
    if (res.ok) {
      const raw = await res.json();
      if (raw && raw.id) {
        return mapRawOffer(raw);
      }
    }
  } catch (err) {
    console.warn(`[offerService] Failed to fetch offer ${id}:`, err);
  }

  // Fallback to all offers
  const all = await getOffers();
  return all.find((o) => o.id === id) || DEFAULT_OFFERS.find((o) => o.id === id) || null;
}

/**
 * Real-time SSE subscriber for instantaneous offer updates from the Cinestar Admin suite.
 */
export function subscribeOfferUpdates(onUpdate: () => void): () => void {
  let eventSource: EventSource | null = null;
  let retryTimeout: any = null;

  function connect() {
    try {
      eventSource = new EventSource(`${API_BASE_URL}/offers/stream`);
      eventSource.onmessage = () => {
        inMemoryOfferCache = null; // Invalidate cache
        onUpdate();
      };
      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        // Retry connection after 5 seconds
        retryTimeout = setTimeout(connect, 5000);
      };
    } catch {
      // EventSource not supported or blocked
    }
  }

  connect();

  return () => {
    if (retryTimeout) clearTimeout(retryTimeout);
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}
