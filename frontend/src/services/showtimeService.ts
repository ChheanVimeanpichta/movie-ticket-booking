import { useState, useEffect, useCallback } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const ADMIN_STORAGE_KEY = "cinestar_admin_static_showtimes_v2";

export interface AssignedScreening {
  id: string;
  movieId: string;
  theaterId?: string;
  venueId?: string;
  venueName: string; // The CineStar venue (e.g. "CineStar Downtown", "CineStar Riverside")
  theaterName: string; // Alias for venueName
  hall: string; // Specific hall (e.g. "Hall 3 - IMAX")
  date: string;
  time: string;
  format: string;
  price: number;
  soldOut?: boolean;
}

export interface SessionCategory {
  name: string;
  price: string;
  times: string[];
  soldOut: string[];
  halls?: string[];
}

export interface VenueData {
  id: string;
  name: string;
  address?: string;
  halls?: Array<{ id: string; name: string; screenType: string }>;
}

let cachedVenues: VenueData[] | null = null;
let lastVenuesFetch = 0;

export async function fetchAdminVenues(): Promise<VenueData[]> {
  const now = Date.now();
  if (cachedVenues && now - lastVenuesFetch < 10000) {
    return cachedVenues;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/theaters/venues`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        cachedVenues = data;
        lastVenuesFetch = now;
        return data;
      }
    }
  } catch (err) {
    console.warn("[showtimeService] Failed to fetch venues from backend:", err);
  }
  return cachedVenues || [];
}

/**
 * Detects if a string represents a hall (screening room), NOT a cinema venue.
 */
export function isHallName(str?: string): boolean {
  if (!str) return false;
  const t = str.trim().toLowerCase();
  return (
    t.startsWith("hall") ||
    t.startsWith("th-hall") ||
    t.startsWith("h-") ||
    /^h[-_]?\d+/i.test(t) ||
    t.includes("hall ") ||
    t.endsWith("hall") ||
    t.includes("auditorium") ||
    t.includes("screen ")
  );
}

/**
 * Resolves a screening record into a clear CineStar Venue (Cinema branch)
 * ensuring that hall names (e.g. "Hall 3") are NEVER displayed as the cinema venue.
 */
export function resolveVenue(
  s: any,
  venueMap: Map<string, string>,
  hallVenueMap: Map<string, string>,
  venues: VenueData[]
): { venueId: string; venueName: string; hallName: string } {
  const rawVenue = (s.venueName || s.theaterName || s.venue || "").trim();
  const rawHall = (s.hall || "").trim();

  // 1. If rawVenue is already a proper Venue name (and NOT a hall)
  if (rawVenue && !isHallName(rawVenue)) {
    return {
      venueId: s.venueId || "v-001",
      venueName: rawVenue,
      hallName: rawHall || (isHallName(s.theaterId) ? s.theaterId.replace(/^th-/, "").replace(/-/g, " ") : "Hall 1"),
    };
  }

  // 2. Lookup by venue ID
  if (s.venueId && venueMap.has(s.venueId)) {
    const vName = venueMap.get(s.venueId)!;
    if (!isHallName(vName)) {
      return {
        venueId: s.venueId,
        venueName: vName,
        hallName: rawHall || (isHallName(rawVenue) ? rawVenue : "Hall 1"),
      };
    }
  }

  // 3. Lookup by theater ID in hallVenueMap
  if (s.theaterId && hallVenueMap.has(s.theaterId)) {
    const vName = hallVenueMap.get(s.theaterId)!;
    if (!isHallName(vName)) {
      return {
        venueId: s.venueId || "v-001",
        venueName: vName,
        hallName: rawHall || (isHallName(rawVenue) ? rawVenue : "Hall 1"),
      };
    }
  }

  // 4. Lookup by hall in hallVenueMap
  if (rawHall && hallVenueMap.has(rawHall.toLowerCase())) {
    const vName = hallVenueMap.get(rawHall.toLowerCase())!;
    if (!isHallName(vName)) {
      return {
        venueId: s.venueId || "v-001",
        venueName: vName,
        hallName: rawHall,
      };
    }
  }

  // 5. Explicit mappings for known CineStar halls & branches
  const searchStr = `${s.theaterId || ""} ${rawHall} ${rawVenue} ${s.venueId || ""}`.toLowerCase();

  if (
    searchStr.includes("riverside") ||
    searchStr.includes("th-hall-5") ||
    searchStr.includes("th-hall-6") ||
    searchStr.includes("hall 5") ||
    searchStr.includes("hall 6")
  ) {
    return {
      venueId: "v-002",
      venueName: "CineStar Riverside",
      hallName: rawHall || (searchStr.includes("6") ? "Hall 6 - Dolby Atmos" : "Hall 5 - VIP Lounge"),
    };
  }

  if (
    searchStr.includes("westgate") ||
    searchStr.includes("th-hall-7") ||
    searchStr.includes("th-hall-8") ||
    searchStr.includes("hall 7") ||
    searchStr.includes("hall 8")
  ) {
    return {
      venueId: "v-003",
      venueName: "CineStar Westgate",
      hallName: rawHall || (searchStr.includes("8") ? "Hall 8 - Laser 2D" : "Hall 7 - ScreenX"),
    };
  }

  if (
    searchStr.includes("olympia") ||
    searchStr.includes("olypia") ||
    searchStr.includes("h-1788")
  ) {
    return {
      venueId: "v-1788767915971",
      venueName: "Cinestar Olypia Mall",
      hallName: rawHall || "Hall 1",
    };
  }

  // Default to CineStar Downtown (covering Hall 1, 2, 3, 4)
  const defaultVenue = venues.find((v) => v.name && !isHallName(v.name))?.name || "CineStar Downtown";
  const defaultVenueId = venues.find((v) => v.id)?.id || "v-001";
  return {
    venueId: defaultVenueId,
    venueName: defaultVenue,
    hallName: rawHall || (isHallName(rawVenue) ? rawVenue : "Hall 3 - IMAX"),
  };
}

/**
 * Fetch all showtimes assigned to a movie by the administrator:
 * 1. Checks Backend API (/api/movies/:id/screenings)
 * 2. Checks local admin state (localStorage key "cinestar_admin_static_showtimes_v2")
 * 3. Enriches with clean CineStar Venue and Hall information
 */
export async function fetchAssignedMovieScreenings(
  movieId: string,
  movieTitle?: string
): Promise<AssignedScreening[]> {
  const screenings: AssignedScreening[] = [];
  const venues = await fetchAdminVenues();

  const venueMap = new Map<string, string>();
  const hallVenueMap = new Map<string, string>();

  venues.forEach((v) => {
    venueMap.set(v.id, v.name);
    if (Array.isArray(v.halls)) {
      v.halls.forEach((h) => {
        hallVenueMap.set(h.id, v.name);
        hallVenueMap.set(h.name.toLowerCase(), v.name);
      });
    }
  });

  const normId = (movieId || "").trim().toLowerCase();
  const normTitle = (movieTitle || "").trim().toLowerCase();

  // 1. Fetch from live CineStar backend API
  try {
    const res = await fetch(`${API_BASE_URL}/movies/${encodeURIComponent(movieId)}/screenings`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        data.forEach((s: any) => {
          const resolved = resolveVenue(s, venueMap, hallVenueMap, venues);

          screenings.push({
            id: s.id || `sc-${Math.random()}`,
            movieId: s.movieId || movieId,
            theaterId: s.theaterId,
            venueId: resolved.venueId,
            venueName: resolved.venueName,
            theaterName: resolved.venueName, // Cinema is ALWAYS the Venue name
            hall: resolved.hallName,
            date: s.date || "Today",
            time: s.time || "18:00",
            format: (s.format || "STANDARD").toUpperCase(),
            price: typeof s.price === "number" ? s.price : 12.0,
            soldOut: Boolean(s.soldOut),
          });
        });
      }
    }
  } catch (err) {
    console.warn("[showtimeService] Failed to fetch movie screenings from API:", err);
  }

  // 2. Cross-check localStorage for showtimes assigned in Admin portal
  try {
    const localData = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (localData) {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed)) {
        parsed.forEach((r: any) => {
          const rTitle = (r.title || "").trim().toLowerCase();
          const rMovieId = (r.movieId || r.id || "").trim().toLowerCase();

          const matches =
            (normId && rMovieId === normId) ||
            (normTitle && rTitle === normTitle) ||
            (normTitle && rTitle.includes(normTitle)) ||
            (normId && rTitle.includes(normId));

          if (matches) {
            const resolved = resolveVenue(r, venueMap, hallVenueMap, venues);

            // Avoid duplicate
            const isDup = screenings.some(
              (existing) =>
                existing.time === r.time &&
                existing.format?.toUpperCase() === (r.format || "").toUpperCase() &&
                existing.venueName === resolved.venueName
            );

            if (!isDup) {
              screenings.push({
                id: r.id || `local-sc-${Math.random()}`,
                movieId: movieId,
                theaterId: r.venueId,
                venueId: resolved.venueId,
                venueName: resolved.venueName,
                theaterName: resolved.venueName,
                hall: resolved.hallName,
                date: r.timeLabel || "Today",
                time: r.time || "19:00",
                format: (r.format || "STANDARD").toUpperCase(),
                price: r.price ? Number(r.price) : 14.0,
                soldOut: r.status === "SOLD OUT",
              });
            }
          }
        });
      }
    }
  } catch (err) {
    console.warn("[showtimeService] Error reading local admin showtimes:", err);
  }

  return screenings;
}

/**
 * Group assigned screenings by Cinema Venue & Format
 */
export function buildSessionsForCinema(
  screenings: AssignedScreening[],
  selectedCinema: string,
  selectedDateLabel?: string
): SessionCategory[] {
  // Filter by the selected Venue
  const venueFiltered = screenings.filter((s) => {
    if (!selectedCinema || selectedCinema === "All Venues") return true;
    const vName = (s.venueName || s.theaterName || "").toLowerCase();
    const cName = selectedCinema.toLowerCase();
    return vName.includes(cName) || cName.includes(vName);
  });

  const relevant = venueFiltered.length > 0 ? venueFiltered : screenings;

  // Group by format (IMAX, 4DX, DOLBY, 2D, STANDARD)
  const formatMap = new Map<
    string,
    { times: Set<string>; soldOut: Set<string>; price: number; halls: Set<string> }
  >();

  relevant.forEach((s) => {
    const fmt = (s.format || "STANDARD").toUpperCase();
    let entry = formatMap.get(fmt);
    if (!entry) {
      entry = { times: new Set<string>(), soldOut: new Set<string>(), price: s.price, halls: new Set<string>() };
      formatMap.set(fmt, entry);
    }
    entry.times.add(s.time);
    if (s.soldOut) {
      entry.soldOut.add(s.time);
    }
    if (s.price) entry.price = s.price;
    if (s.hall) entry.halls.add(s.hall);
  });

  const categories: SessionCategory[] = [];
  formatMap.forEach((val, fmt) => {
    let displayName = `${fmt} EXPERIENCE`;
    if (fmt === "2D") displayName = "DIGITAL 2D";
    if (fmt === "STANDARD") displayName = "STANDARD DIGITAL";
    if (fmt === "DOLBY") displayName = "DOLBY ATMOS";
    if (fmt === "4DX") displayName = "4DX IMMERSIVE";

    const timesSorted = Array.from(val.times).sort();
    categories.push({
      name: displayName,
      price: `$${val.price.toFixed(2)} per ticket`,
      times: timesSorted,
      soldOut: Array.from(val.soldOut),
      halls: Array.from(val.halls),
    });
  });

  return categories;
}

/**
 * Hook to dynamically track admin showtimes for a movie
 */
export function useMovieShowtimes(movieId?: string, movieTitle?: string) {
  const [screenings, setScreenings] = useState<AssignedScreening[]>([]);
  const [cinemas, setCinemas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkShowtimes = useCallback(async () => {
    if (!movieId) {
      setScreenings([]);
      setCinemas([]);
      setIsLoading(false);
      return;
    }

    try {
      const result = await fetchAssignedMovieScreenings(movieId, movieTitle);
      setScreenings(result);
      setLastChecked(new Date());

      // Extract unique CineStar Venues that have assigned showtimes for this movie
      const uniqueVenues = Array.from(
        new Set(
          result
            .map((s) => s.venueName)
            .filter((name): name is string => Boolean(name) && !isHallName(name))
        )
      );

      if (uniqueVenues.length === 0 && result.length > 0) {
        uniqueVenues.push("CineStar Downtown");
      }
      setCinemas(uniqueVenues);

      if (result.length === 0) {
        console.log(
          `[Showtime Tracker] No showtimes assigned by admin for movie: "${movieTitle || movieId}" (ID: ${movieId}).`
        );
      } else {
        console.log(
          `[Showtime Tracker] Loaded ${result.length} assigned showtime(s) across venues: [${uniqueVenues.join(", ")}].`
        );
      }
    } catch (err) {
      console.warn("[useMovieShowtimes] Failed to check showtimes:", err);
    } finally {
      setIsLoading(false);
    }
  }, [movieId, movieTitle]);

  useEffect(() => {
    setIsLoading(true);
    checkShowtimes();

    // Real-time polling every 4 seconds to track live admin changes
    const interval = setInterval(checkShowtimes, 4000);

    const onFocus = () => checkShowtimes();
    const onStorage = (e: StorageEvent) => {
      if (e.key === ADMIN_STORAGE_KEY) {
        checkShowtimes();
      }
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, [checkShowtimes]);

  const hasAssignedShowtimes = screenings.length > 0;

  return {
    screenings,
    cinemas,
    hasAssignedShowtimes,
    isLoading,
    lastChecked,
    refetch: checkShowtimes,
  };
}
