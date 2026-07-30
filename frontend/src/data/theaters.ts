export interface Theater {
  id: string;
  name: string;
  address: string;
  city: string;
  distance: string;
  distanceValue: number;
  image: string;
  tags: string[]; // "IMAX" | "4DX" | "GOLD_CLASS" | "DOLBY_ATMOS"
  x: number; // % position on map
  y: number; // % position on map
}

export const theaters: Theater[] = [
  {
    id: "grand-metropolitan",
    name: "Grand Metropolitan",
    address: "456 Cinema Blvd",
    city: "Los Angeles, CA",
    distance: "2.4 mi",
    distanceValue: 2.4,
    image: "https://c8.alamy.com/comp/G2DN6J/movie-theater-promenade-G2DN6J.jpg",
    tags: ["GOLD_CLASS", "DOLBY_ATMOS"],
    x: 62,
    y: 55,
  },
  {
    id: "onyx-suite",
    name: "The Onyx Suite",
    address: "12 Starry Way",
    city: "Beverly Hills, CA",
    distance: "5.1 mi",
    distanceValue: 5.1,
    image: "https://i0.wp.com/www.capemaymag.com/site/wp-content/uploads/lobby-HST.jpg?fit=800%2C398&amp;ssl=1",
    tags: ["GOLD_CLASS"],
    x: 78,
    y: 30,
  },
  {
    id: "imax-zenith",
    name: "IMAX Zenith Center",
    address: "789 Tech Plaza",
    city: "Santa Monica, CA",
    distance: "8.7 mi",
    distanceValue: 8.7,
    image: "https://p.turbosquid.com/ts-thumb/nW/BH7tbs/SK/01/jpg/1646280743/1920x1080/fit_q87/18a0c0acf1b41c82363bf7ebff1ff909646cf6be/01.jpg",
    tags: ["IMAX", "4DX"],
    x: 45,
    y: 78,
  },
];

export const theaterFilters = [
  { id: "all", label: "All Locations" },
  { id: "IMAX", label: "IMAX®" },
  { id: "4DX", label: "4DX™" },
  { id: "GOLD_CLASS", label: "Gold Class" },
  { id: "DOLBY_ATMOS", label: "Dolby Atmos" },
] as const;

export const amenities = [
  {
    icon: "Clapperboard",
    title: "IMAX® Experience",
    description:
      "Crystal-clear images and heart-pounding sound. IMAX's customized theater geometry brings movies to life.",
  },
  {
    icon: "Vibrate",
    title: "4DX™ Technology",
    description:
      "Experience 21 different effects including motion, water, fog, wind, and scents synchronized with the action.",
  },
  {
    icon: "Wine",
    title: "Gold Class Luxury",
    description:
      "Full-service in-cinema dining, reclining chairs, and a private lounge for the ultimate VIP treatment.",
  },
];