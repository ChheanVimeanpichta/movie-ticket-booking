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
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWY9YlOpu9dKsNZb7Va9AgzIdVPXZlJs-19XeP7JkudA&s=10",
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
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6fUAg8ksc3Djlwp5yxGqiDNS_ChIjas1yskFqOyGPPQ&s=10",
    landscape: "https://picsum.photos/seed/hollow-land/800/450",
    synopsis:
      "A family inherits a house that remembers every sound it has ever heard and starts playing them back.",
    showtimes: ["17:30", "20:00", "22:45"],
  },
  {
    id: "moana-static",
    title: "Moana 2: Static",
    genre: "Animation / Sci-Fi",
    rating: "PG",
    runtime: "1h 38m",
    score: 8.9,
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAqpvA_h7pG5nUeETP_dERgDuWswzPbs201Fyi6mfZdg&s=10",
    landscape: "https://picsum.photos/seed/pixel-land/800/450",
    synopsis:
      "In a city built from discarded code, one broken pixel sets out to find where the glitches go.",
    showtimes: ["11:00", "13:15", "16:00", "18:30"],
  },
  {
    id: "Dora",
    title: "Dora and the Lost City of Gold",
    genre: "Fantasy / Adventure",
    rating: "PG-13",
    runtime: "2h 34m",
    score: 8.1,
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjYAbQLfa6xzRFKo4r-5VsnwMCsFHw8pZYNfKmgU8L0w&s=10",
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

export type GridMovie = {
  id: string;
  title: string;
  genre: string;
  score: number | null;
  poster: string;
  badge?: "IMAX" | "4DX" | "CineStar";
  extra?: string;
  hasBookBtn?: boolean;
};

export const nowShowingGrid: GridMovie[] = [
  {
    id: "avenger",
    title: "Avengers: Endgame",
    genre: "Action/Sci-Fi",
    score: 8.9,
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWWatxhrUO2mPie7B5xc-V8DXxsGe9a4CFhAfBIvbJPA&s=10",
    badge: "IMAX",
    extra: "When the signal dies, the city follows.",
    hasBookBtn: true,
  },
  {
    id: "fairy secret",
    title: "The Fairy Secret",
    genre: "Action",
    score: 7.4,
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdLMFblwS4y1QbzHFKs9g150scJslcAsSxTcdJMwid4w&s=10",
    badge: "4DX",
    extra: "Every spire hides a secret.",
  },
  {
    id: "jurrasic-echoes",
    title: "Jurrasic Echoes",
    genre: "Drama",
    score: 9.2,
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXVj1jwI4fGAbXd6dOf3emm0PzHhQj9-ZK6nv13pb5dQ&s=10",
    badge: "CineStar",
    extra: "Dir. A.G. Iñárritu",
  },
  {
    id: "princes",
    title: "The 12 dancing princesses",
    genre: "Sci-Fi",
    score: 8.1,
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtWdSsPc3Lf9zMSAufsmKPEQ-aAiFwWyIVXNghzTx5UA&s=10",
    badge: "IMAX",
    extra: "Beyond the known universe.",
  },
  {
    id: "pirate-echoes",
    title: "Pirate Fair: Echoes of the Sea",
    genre: "Horror",
    score: 6.8,
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdXmUXa0G1ezo-TA0vrr_GAhisBMegQz09jeJbDCgkRw&s=10",
    extra: "No vacancy. No escape.",
  },
  {
    id: "spider-verse-2",
    title: "SPIDER-MAN: INTO THE SPIDER-VERSE 2",
    genre: "",
    score: 8.5,
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoGytKPuYMT7IQulS8QemehYHgNiNsOyuoxX2rbQsPdw&s=10",
    badge: "4DX",
    extra: "Rise of the empire.",
    hasBookBtn: true,
  },
  {
    id: "raya",
    title: "Raya and the Last Dragon",
    genre: "Mystery",
    score: null,
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm9pl3ezvWPpgU1UoObqXTpjE5Q4GskYSfKcZJNNNvFw&s=10",
    badge: "CineStar",
    extra: "Trust no one.",
  },
  {
    id: "sheep",
    title: "Sheep Detective",
    genre: "Sci-Fi/Drama",
    score: null,
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQnkapobjb_5fwfdC2YryPjTwmooJ8HLLcQIs0Aomi0A&s=10",
    extra: "The signal came from nowhere.",
  },
  {
    id: "avatar",
    title: "Avatar: The Way of Water",
    genre: "Thriller",
    score: null,
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsteWOIgIfjtkiYRnJNRzinTz0TXz3d3Z4bxdkoI1u2Q&s=10",
    extra: "The mind is the final frontier.",
  },
  {
    id: "hopper",
    title: "HOPPER",
    genre: "Action/Sci-Fi",
    score: null,
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTF2_jzf8Bot1lnxHSeU7iw5ZCTXLsAD9EkRWqOsVAzZw&s=10",
    extra: "Humanity. Upgraded.",
  },
  {
    id: "Forn",
    title: "Tinker Bell and the Legend of the Neverbeast",
    genre: "Mystery/Adventure",
    score: null,
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxbLJ65BPJksC0H21bjjmYF8-0LfHkmVrHnwSo4o09kQ&s=10",
    extra: "Humanity. Upgraded.",
  },
  {
    id: "barbie",
    title: "Barbie: Princess Charm School ",
    genre: "Drama",
    score: null,
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2LRKh6UujWBbI5KWrAY0EGn93XVUn-shxv0EMLZ6qGw&s=10",
    extra: "Humanity. Upgraded.",
  },
  {
    id: "swapp",
    title: " Swapped",
    genre: "Drama/Adventure",
    score: null,
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSF5wtLqYgJrada9i_nneLJWtnWe31R6zgAi541ky0bg&s=10",
    extra: "Humanity. Upgraded.",
  },
  {
    id: "mermaid",
    title: " Barbie in a Mermaid Tale",
    genre: "Drama/Adventure",
    score: null,
    poster: "https://m.media-amazon.com/images/M/MV5BZWMwYWFmMDgtYTAyMy00OWRjLTgxYTEtZWYyZjcwNDNjY2I0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    extra: "Humanity. Upgraded.",
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


