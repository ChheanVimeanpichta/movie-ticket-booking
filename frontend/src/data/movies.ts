export type Movie = {
  id: string;
  title: string;
  genre: string;
  rating: string;
  runtime: string;
  score: number;
  poster: string;
  landscape: string;
  synopsis: string;
  showtimes: string[];
  releaseDate?: string;
};

export const nowShowing: Movie[] = [
  {
    id: "iron-verdict",
    title: "Iron Verdict",
    genre: "Action / Crime",
    rating: "PG-13",
    runtime: "2h 21m",
    score: 8.4,
    poster: "https://picsum.photos/seed/iron-poster/400/600",
    landscape: "https://picsum.photos/seed/iron-land/800/450",
    synopsis:
      "A disgraced detective is pulled back into the city's underworld when the one case he never closed resurfaces.",
    showtimes: ["12:30", "15:45", "19:00", "22:15"],
  },
  {
    id: "hollow-house",
    title: "Hollow House",
    genre: "Horror / Thriller",
    rating: "R",
    runtime: "1h 47m",
    score: 7.6,
    poster: "https://picsum.photos/seed/hollow-poster/400/600",
    landscape: "https://picsum.photos/seed/hollow-land/800/450",
    synopsis:
      "A family inherits a house that remembers every sound it has ever heard and starts playing them back.",
    showtimes: ["17:30", "20:00", "22:45"],
  },
  {
    id: "pixel-static",
    title: "Pixel Static",
    genre: "Animation / Sci-Fi",
    rating: "PG",
    runtime: "1h 38m",
    score: 8.9,
    poster: "https://picsum.photos/seed/pixel-poster/400/600",
    landscape: "https://picsum.photos/seed/pixel-land/800/450",
    synopsis:
      "In a city built from discarded code, one broken pixel sets out to find where the glitches go.",
    showtimes: ["11:00", "13:15", "16:00", "18:30"],
  },
  {
    id: "frost-king",
    title: "The Frost King",
    genre: "Fantasy / Adventure",
    rating: "PG-13",
    runtime: "2h 34m",
    score: 8.1,
    poster: "https://picsum.photos/seed/frost-poster/400/600",
    landscape: "https://picsum.photos/seed/frost-land/800/450",
    synopsis:
      "The last heir to a frozen throne must cross the Long Winter to reclaim a crown that despises her.",
    showtimes: ["14:00", "17:45", "21:15"],
  },
  {
    id: "neon-rider",
    title: "Neon Rider",
    genre: "Sci-Fi / Action",
    rating: "PG-13",
    runtime: "2h 10m",
    score: 7.9,
    poster: "https://picsum.photos/seed/neon-poster/400/600",
    landscape: "https://picsum.photos/seed/neon-land/800/450",
    synopsis:
      "In a cyberpunk metropolis, a courier discovers her latest package contains a virus that could bring down the grid.",
    showtimes: ["13:00", "16:15", "19:30", "22:00"],
  },
  {
    id: "velvet-thunder",
    title: "Velvet Thunder",
    genre: "Drama / Music",
    rating: "R",
    runtime: "2h 02m",
    score: 8.6,
    poster: "https://picsum.photos/seed/velvet-poster/400/600",
    landscape: "https://picsum.photos/seed/velvet-land/800/450",
    synopsis:
      "A washed-up rock star gets one last shot at glory when a young producer offers him a song that could change everything.",
    showtimes: ["14:30", "17:45", "21:00"],
  },
  {
    id: "shadow-line",
    title: "Shadow Line",
    genre: "War / Drama",
    rating: "R",
    runtime: "2h 28m",
    score: 8.3,
    poster: "https://picsum.photos/seed/shadow-poster/400/600",
    landscape: "https://picsum.photos/seed/shadow-land/800/450",
    synopsis:
      "Based on true events, a unit of soldiers must hold a critical position against impossible odds.",
    showtimes: ["11:30", "15:00", "18:30", "21:45"],
  },
  {
    id: "crimson-tide",
    title: "Crimson Tide",
    genre: "Action / Adventure",
    rating: "PG-13",
    runtime: "1h 55m",
    score: 7.8,
    poster: "https://picsum.photos/seed/crimson-poster/400/600",
    landscape: "https://picsum.photos/seed/crimson-land/800/450",
    synopsis:
      "A deep-sea salvage crew stumbles upon an ancient temple that holds a power beyond imagination.",
    showtimes: ["12:00", "15:30", "19:00", "22:30"],
  },
];

export const comingSoon: Movie[] = [
  {
    id: "nightshade-protocol",
    title: "Nightshade Protocol",
    genre: "Sci-Fi / Thriller",
    rating: "PG-13",
    runtime: "2h 05m",
    score: 0,
    poster: "https://picsum.photos/seed/nightshade-poster/400/600",
    landscape: "https://picsum.photos/seed/nightshade-land/800/450",
    synopsis: "A courier AI discovers the package it's been delivering is itself.",
    showtimes: [],
    releaseDate: "12 AUG 2026",
  },
  {
    id: "glass-orchard",
    title: "Glass Orchard",
    genre: "Drama",
    rating: "PG-13",
    runtime: "1h 56m",
    score: 0,
    poster: "https://picsum.photos/seed/glass-poster/400/600",
    landscape: "https://picsum.photos/seed/glass-land/800/450",
    synopsis: "Three sisters return to the family orchard the summer it's sold.",
    showtimes: [],
    releaseDate: "19 AUG 2026",
  },
  {
    id: "midnight-ferry",
    title: "Midnight Ferry",
    genre: "Mystery",
    rating: "R",
    runtime: "1h 49m",
    score: 0,
    poster: "https://picsum.photos/seed/midnight-poster/400/600",
    landscape: "https://picsum.photos/seed/midnight-land/800/450",
    synopsis: "The last ferry of the night never runs empty.",
    showtimes: [],
    releaseDate: "26 AUG 2026",
  },
  {
    id: "salt-and-static",
    title: "Salt & Static",
    genre: "Romance / Drama",
    rating: "PG-13",
    runtime: "1h 52m",
    score: 0,
    poster: "https://picsum.photos/seed/salt-poster/400/600",
    landscape: "https://picsum.photos/seed/salt-land/800/450",
    synopsis: "A lighthouse keeper and a radio operator, ninety miles apart.",
    showtimes: [],
    releaseDate: "02 SEP 2026",
  },
  {
    id: "echo-bend",
    title: "Echo Bend",
    genre: "Horror / Sci-Fi",
    rating: "R",
    runtime: "1h 44m",
    score: 0,
    poster: "https://picsum.photos/seed/echo-poster/400/600",
    landscape: "https://picsum.photos/seed/echo-land/800/450",
    synopsis: "A research team in a remote canyon discovers sound can rewind time.",
    showtimes: [],
    releaseDate: "09 SEP 2026",
  },
  {
    id: "golden-hour",
    title: "Golden Hour",
    genre: "Comedy / Drama",
    rating: "PG",
    runtime: "1h 40m",
    score: 0,
    poster: "https://picsum.photos/seed/golden-poster/400/600",
    landscape: "https://picsum.photos/seed/golden-land/800/450",
    synopsis: "A retired photographer and a runaway teen form an unlikely friendship.",
    showtimes: [],
    releaseDate: "16 SEP 2026",
  },
];

export const heroSlides = [
  {
    image: "https://picsum.photos/seed/hero-bg1/1600/900",
    title: "IRON",
    subtitle: "VERDICT",
    description:
      "A disgraced detective is pulled back into the city's underworld when the one case he never closed resurfaces, threatening to destroy everything he rebuilt.",
    badges: ["NOW SHOWING", "IMAX 2D"],
  },
  {
    image: "https://picsum.photos/seed/hero-bg2/1600/900",
    title: "PIXEL",
    subtitle: "STATIC",
    description:
      "In a city built from discarded code, one broken pixel sets out on an epic journey to find where all the glitches go before the entire system crashes.",
    badges: ["NOW SHOWING", "3D"],
  },
  {
    image: "https://picsum.photos/seed/hero-bg3/1600/900",
    title: "THE FROST",
    subtitle: "KING",
    description:
      "The last heir to a frozen throne must cross the Long Winter to reclaim a crown that despises her, with only a reluctant dragon as her companion.",
    badges: ["NOW SHOWING", "IMAX 2D"],
  },
];


