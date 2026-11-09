// src/services/slideService.ts
// Connects movie-ticket-booking slideshow to the Cinestar Admin backend Slides API
import { heroSlides } from "@/data/movies";

export interface SlideItem {
  id?: string;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  badges: string[];
  linkUrl?: string;
  status?: string;
  order?: number;
}

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:5000/api";

export const DEFAULT_HERO_SLIDES: SlideItem[] = heroSlides.map((s, idx) => ({
  id: `default-slide-${idx + 1}`,
  image: s.image,
  title: s.title,
  subtitle: s.subtitle,
  description: s.description,
  badges: s.badges || ["NOW SHOWING"],
  linkUrl: "/movies",
  status: "Active",
  order: idx + 1,
}));

let inMemorySlideCache: SlideItem[] | null = null;

function normalizeBadges(raw: any): string[] {
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((b) => String(b).trim()).filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return ["NOW SHOWING", "IMAX 2D"];
}

function mapRawSlide(raw: any, index: number): SlideItem {
  return {
    id: String(raw.id || `slide-${index}`),
    image:
      raw.image ||
      "https://picsum.photos/seed/hero-bg/1600/900",
    title: raw.title || "CINEMA PREMIERE",
    subtitle: raw.subtitle || "",
    description:
      raw.description ||
      "Experience the ultimate blockbuster cinema on the biggest screens in the city.",
    badges: normalizeBadges(raw.badges),
    linkUrl: raw.linkUrl || "/movies",
    status: raw.status || "Active",
    order: typeof raw.order === "number" ? raw.order : index + 1,
  };
}

/**
 * Fetch active slides for the hero slideshow from Cinestar Admin backend.
 * Falls back gracefully to default heroSlides if unreachable.
 */
export async function getSlides(): Promise<SlideItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/slides?_t=${Date.now()}`);
    if (!res.ok) {
      throw new Error(`Slides API returned status ${res.status}`);
    }
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const activeSlides = data
        .filter((s: any) => !s.status || s.status.toLowerCase() === "active")
        .map(mapRawSlide)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      if (activeSlides.length > 0) {
        inMemorySlideCache = activeSlides;
        return activeSlides;
      }
    }
  } catch (err) {
    console.warn("[slideService] Could not fetch live slides from admin backend, using default slides:", err);
  }

  if (inMemorySlideCache && inMemorySlideCache.length > 0) {
    return inMemorySlideCache;
  }
  return DEFAULT_HERO_SLIDES;
}

/**
 * Real-time SSE subscriber for instantaneous slideshow updates from Cinestar Admin suite.
 */
export function subscribeSlideUpdates(onUpdate: () => void): () => void {
  let eventSource: EventSource | null = null;
  let retryTimer: any = null;

  function connect() {
    try {
      eventSource = new EventSource(`${API_BASE_URL}/slides/stream`);
      eventSource.onmessage = () => {
        inMemorySlideCache = null; // Invalidate cache
        onUpdate();
      };
      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        retryTimer = setTimeout(connect, 5000);
      };
    } catch {
      // EventSource not supported or blocked
    }
  }

  connect();

  return () => {
    if (retryTimer) clearTimeout(retryTimer);
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}
