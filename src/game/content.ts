// Static game content for AbujaLife. Pure data — no logic.
// Business names are fictional; landmarks are referred to as "areas".

export const DISTRICT_IDS = [
  "cbd", "wuse", "wuse2", "garki", "maitama", "asokoro", "jabi", "utako", "gwarinpa", "lifecamp",
  "mabushi", "kado", "jahi", "katampe", "apo", "lokogoma", "galadimawa", "lugbe", "kubwa",
] as const;
export type DistrictId = (typeof DISTRICT_IDS)[number];

export interface District {
  id: DistrictId;
  name: string;
  tier: 1 | 2 | 3 | 4;
  tagline: string;
  x: number; // world map units (0–1000 x 0–750)
  y: number;
  landmarks: string[];
  density: number; // building density 1–5
}

export const DISTRICTS: District[] = [
  { id: "cbd", name: "Central Area", tier: 4, tagline: "Ministries, towers and the national skyline.", x: 640, y: 380, landmarks: ["National Mosque area", "National Christian Centre area", "Federal Secretariat"], density: 5 },
  { id: "wuse", name: "Wuse", tier: 2, tagline: "Wuse Market noise and commercial energy.", x: 470, y: 360, landmarks: ["Wuse commercial area", "Wuse Market"], density: 5 },
  { id: "wuse2", name: "Wuse 2", tier: 3, tagline: "Nightlife, startups and the Banex hustle.", x: 545, y: 300, landmarks: ["Aminu Kano Crescent", "Gadget plazas"], density: 4 },
  { id: "garki", name: "Garki", tier: 2, tagline: "Banks, markets and government offices.", x: 655, y: 480, landmarks: ["Garki commercial area", "Area 11"], density: 4 },
  { id: "maitama", name: "Maitama", tier: 4, tagline: "Embassies, old money, quiet power.", x: 570, y: 180, landmarks: ["Millennium Park", "Diplomatic Zone"], density: 2 },
  { id: "asokoro", name: "Asokoro", tier: 4, tagline: "Gated mansions in the shadow of the Rock.", x: 820, y: 400, landmarks: ["Aso Rock area", "Presidential area"], density: 2 },
  { id: "jabi", name: "Jabi", tier: 3, tagline: "Lakeside malls and weekend vibes.", x: 255, y: 410, landmarks: ["Jabi Lake", "Lakeside promenade"], density: 3 },
  { id: "utako", name: "Utako", tier: 2, tagline: "Motor parks, plazas and moving traffic.", x: 355, y: 370, landmarks: ["Utako Motor Park"], density: 4 },
  { id: "gwarinpa", name: "Gwarinpa", tier: 2, tagline: "Endless avenues of family homes.", x: 175, y: 175, landmarks: ["Gwarinpa residential area", "3rd Avenue"], density: 4 },
  { id: "lifecamp", name: "Life Camp", tier: 3, tagline: "Leafy estates on the edge of town.", x: 240, y: 285, landmarks: ["Life Camp estates"], density: 2 },
  { id: "mabushi", name: "Mabushi", tier: 3, tagline: "Rising towers off the expressway.", x: 440, y: 255, landmarks: ["Mabushi junction"], density: 3 },
  { id: "kado", name: "Kado", tier: 3, tagline: "Quiet streets and the fish market.", x: 330, y: 300, landmarks: ["Kado fish market"], density: 3 },
  { id: "jahi", name: "Jahi", tier: 2, tagline: "New estates and busy builders.", x: 340, y: 215, landmarks: ["Jahi estates"], density: 3 },
  { id: "katampe", name: "Katampe", tier: 4, tagline: "Hilltop views over the whole city.", x: 440, y: 125, landmarks: ["Katampe hills"], density: 2 },
  { id: "apo", name: "Apo", tier: 2, tagline: "Mechanic village and legislators' quarters.", x: 630, y: 610, landmarks: ["Apo mechanic village"], density: 3 },
  { id: "lokogoma", name: "Lokogoma", tier: 1, tagline: "Young families, new roads, cheap rent.", x: 485, y: 625, landmarks: ["Lokogoma estates"], density: 3 },
  { id: "galadimawa", name: "Galadimawa", tier: 1, tagline: "Roundabout life and roadside suya.", x: 365, y: 610, landmarks: ["Galadimawa roundabout"], density: 3 },
  { id: "lugbe", name: "Lugbe", tier: 1, tagline: "Airport road grind, affordable rent.", x: 185, y: 640, landmarks: ["Airport Road", "Lugbe Market"], density: 3 },
  { id: "kubwa", name: "Kubwa", tier: 1, tagline: "Where most Abuja stories begin.", x: 70, y: 70, landmarks: ["Kubwa Village Market", "Arab Road"], density: 4 },
];

export const FUTURE_DISTRICTS = [
  { name: "Bwari", x: 300, y: 30 }, { name: "Karu", x: 940, y: 560 }, { name: "Nyanya", x: 950, y: 470 }, { name: "Airport District", x: 60, y: 715 },
];

export const districtById = (id: string) => DISTRICTS.find((d) => d.id === id) ?? DISTRICTS.find((d) => d.id === "kubwa")!;

export interface Job {
  id: string; title: string; employer: string; district: DistrictId;
  pay: number; energy: number; hunger: number; xp: number; minLevel: number; hours: number;
}

export const JOBS: Job[] = [
  { id: "keke", title: "Keke Rider", employer: "Kubwa Keke Union", district: "kubwa", pay: 6000, energy: 25, hunger: 15, xp: 20, minLevel: 1, hours: 6 },
  { id: "pos", title: "POS Agent", employer: "Arab Road Kiosk", district: "kubwa", pay: 5000, energy: 15, hunger: 10, xp: 18, minLevel: 1, hours: 6 },
  { id: "trader", title: "Market Trader", employer: "Lugbe Market", district: "lugbe", pay: 7000, energy: 22, hunger: 15, xp: 22, minLevel: 1, hours: 7 },
  { id: "loader", title: "Bus Conductor", employer: "Utako Motor Park", district: "utako", pay: 6500, energy: 24, hunger: 14, xp: 20, minLevel: 1, hours: 6 },
  { id: "suya", title: "Suya Spot Assistant", employer: "Mallam Garba Suya", district: "wuse2", pay: 8000, energy: 20, hunger: 8, xp: 25, minLevel: 2, hours: 6 },
  { id: "mechanic", title: "Apprentice Mechanic", employer: "Apo Auto Clinic", district: "apo", pay: 8500, energy: 26, hunger: 15, xp: 26, minLevel: 2, hours: 7 },
  { id: "csr", title: "Customer Service Rep", employer: "Lakeside Mall", district: "jabi", pay: 12000, energy: 18, hunger: 12, xp: 35, minLevel: 2, hours: 8 },
  { id: "creator", title: "Content Creator", employer: "Self-employed", district: "gwarinpa", pay: 10000, energy: 15, hunger: 10, xp: 40, minLevel: 2, hours: 5 },
  { id: "teller", title: "Bank Teller", employer: "Zuma Trust Bank", district: "garki", pay: 18000, energy: 20, hunger: 12, xp: 45, minLevel: 3, hours: 8 },
  { id: "nurse", title: "Nurse", employer: "Jahi Specialist Hospital", district: "jahi", pay: 22000, energy: 30, hunger: 15, xp: 55, minLevel: 4, hours: 9 },
  { id: "dev", title: "Junior Developer", employer: "Crescent Tech Hub", district: "wuse2", pay: 30000, energy: 22, hunger: 14, xp: 70, minLevel: 5, hours: 8 },
  { id: "analyst", title: "Policy Analyst", employer: "Federal Secretariat", district: "cbd", pay: 38000, energy: 18, hunger: 12, xp: 75, minLevel: 5, hours: 8 },
  { id: "realtor", title: "Real Estate Agent", employer: "Mabushi Realty", district: "mabushi", pay: 40000, energy: 25, hunger: 15, xp: 80, minLevel: 6, hours: 7 },
  { id: "civil", title: "Director, Ministry", employer: "Federal Ministry", district: "asokoro", pay: 55000, energy: 15, hunger: 12, xp: 90, minLevel: 7, hours: 7 },
  { id: "lawyer", title: "Corporate Lawyer", employer: "Maitama Chambers", district: "maitama", pay: 90000, energy: 30, hunger: 18, xp: 130, minLevel: 9, hours: 10 },
];
export const jobById = (id: string | null | undefined) => JOBS.find((j) => j.id === id);

export interface Home {
  id: string; name: string; district: DistrictId; rent: number; prestige: number; minLevel: number;
  size: number; // room grid size (tiles)
  floor: string; wall: string; // art palette
}

export const HOMES: Home[] = [
  { id: "kubwa_room", name: "Single Room, Kubwa", district: "kubwa", rent: 0, prestige: 0, minLevel: 1, size: 6, floor: "oklch(0.62 0.04 60)", wall: "oklch(0.78 0.03 85)" },
  { id: "lugbe_selfcon", name: "Self-Contain, Lugbe", district: "lugbe", rent: 120000, prestige: 5, minLevel: 2, size: 7, floor: "oklch(0.66 0.05 65)", wall: "oklch(0.82 0.04 95)" },
  { id: "lokogoma_mini", name: "Mini Flat, Lokogoma", district: "lokogoma", rent: 250000, prestige: 8, minLevel: 2, size: 7, floor: "oklch(0.7 0.04 70)", wall: "oklch(0.84 0.03 140)" },
  { id: "gwarinpa_flat", name: "2-Bed Flat, Gwarinpa", district: "gwarinpa", rent: 450000, prestige: 15, minLevel: 3, size: 8, floor: "oklch(0.58 0.07 55)", wall: "oklch(0.86 0.03 90)" },
  { id: "lifecamp_terrace", name: "Terrace, Life Camp", district: "lifecamp", rent: 800000, prestige: 22, minLevel: 4, size: 8, floor: "oklch(0.55 0.06 50)", wall: "oklch(0.85 0.04 160)" },
  { id: "jabi_apt", name: "Lake-View Apartment, Jabi", district: "jabi", rent: 1200000, prestige: 30, minLevel: 5, size: 9, floor: "oklch(0.8 0.02 80)", wall: "oklch(0.88 0.03 220)" },
  { id: "wuse_pent", name: "Penthouse, Wuse 2", district: "wuse2", rent: 3000000, prestige: 50, minLevel: 7, size: 10, floor: "oklch(0.42 0.03 60)", wall: "oklch(0.9 0.01 85)" },
  { id: "maitama_duplex", name: "Detached Duplex, Maitama", district: "maitama", rent: 8000000, prestige: 80, minLevel: 9, size: 11, floor: "oklch(0.86 0.02 85)", wall: "oklch(0.9 0.03 75)" },
  { id: "asokoro_mansion", name: "Mansion, Asokoro", district: "asokoro", rent: 20000000, prestige: 120, minLevel: 11, size: 12, floor: "oklch(0.9 0.015 90)", wall: "oklch(0.93 0.02 80)" },
];
export const homeById = (id: string) => HOMES.find((h) => h.id === id) ?? HOMES[0]!;

// ---------- Furniture ----------
export const FURNITURE_CATS = ["Sleep", "Kitchen", "Bathroom", "Comfort", "Entertainment", "Work", "Decoration", "Luxury"] as const;
export type FurnitureCat = (typeof FURNITURE_CATS)[number];
export type ItemShape = "bed" | "box" | "tv" | "plant" | "seat" | "table" | "lamp" | "rug" | "tall" | "bath";

export interface Effect {
  hunger?: number; energy?: number; happy?: number; hygiene?: number; social?: number;
  xp?: number; rep?: number; cost?: number; earn?: number; minutes: number;
}

export interface FurnitureItem {
  id: string; name: string; cat: FurnitureCat; price: number;
  w: number; d: number; h: number; // tiles, tiles, px height
  quality: 1 | 2 | 3 | 4 | 5; comfort: number;
  color: string; shape: ItemShape; verb?: string; use?: Effect;
}

export const FURNITURE: FurnitureItem[] = [
  // Sleep
  { id: "mat_bed", name: "Foam Mattress", cat: "Sleep", price: 0, w: 2, d: 1, h: 10, quality: 1, comfort: 2, color: "oklch(0.7 0.08 240)", shape: "bed", verb: "Sleep", use: { energy: 40, minutes: 480 } },
  { id: "single_bed", name: "Wooden Single Bed", cat: "Sleep", price: 25000, w: 2, d: 1, h: 22, quality: 2, comfort: 5, color: "oklch(0.55 0.08 50)", shape: "bed", verb: "Sleep", use: { energy: 60, happy: 3, minutes: 480 } },
  { id: "queen_bed", name: "Queen Bed, Adire Linen", cat: "Sleep", price: 120000, w: 2, d: 2, h: 26, quality: 3, comfort: 10, color: "oklch(0.45 0.1 250)", shape: "bed", verb: "Sleep", use: { energy: 80, happy: 6, minutes: 480 } },
  { id: "king_bed", name: "Orthopaedic King Bed", cat: "Sleep", price: 450000, w: 3, d: 2, h: 30, quality: 4, comfort: 16, color: "oklch(0.35 0.06 160)", shape: "bed", verb: "Sleep", use: { energy: 100, happy: 10, minutes: 480 } },
  // Kitchen
  { id: "stove_kerosene", name: "Kerosene Stove", cat: "Kitchen", price: 0, w: 1, d: 1, h: 18, quality: 1, comfort: 0, color: "oklch(0.5 0.12 30)", shape: "box", verb: "Cook jollof", use: { hunger: 30, cost: 800, minutes: 60 } },
  { id: "gas_cooker", name: "4-Burner Gas Cooker", cat: "Kitchen", price: 60000, w: 1, d: 1, h: 34, quality: 3, comfort: 2, color: "oklch(0.85 0.01 90)", shape: "box", verb: "Cook egusi & swallow", use: { hunger: 45, happy: 4, cost: 1200, minutes: 60 } },
  { id: "fridge_small", name: "Table-top Fridge", cat: "Kitchen", price: 85000, w: 1, d: 1, h: 40, quality: 2, comfort: 1, color: "oklch(0.9 0.01 220)", shape: "tall", verb: "Grab a snack", use: { hunger: 15, happy: 2, cost: 500, minutes: 10 } },
  { id: "fridge_double", name: "Double-door Fridge", cat: "Kitchen", price: 320000, w: 1, d: 1, h: 70, quality: 4, comfort: 3, color: "oklch(0.75 0.01 240)", shape: "tall", verb: "Chilled zobo & meat pie", use: { hunger: 25, happy: 6, cost: 700, minutes: 10 } },
  { id: "sink", name: "Kitchen Sink", cat: "Kitchen", price: 30000, w: 1, d: 1, h: 30, quality: 2, comfort: 1, color: "oklch(0.8 0.02 200)", shape: "box", verb: "Wash up", use: { hygiene: 10, minutes: 15 } },
  { id: "dining_table", name: "Mahogany Dining Set", cat: "Kitchen", price: 95000, w: 2, d: 1, h: 26, quality: 3, comfort: 5, color: "oklch(0.42 0.07 45)", shape: "table" },
  // Bathroom
  { id: "bucket_bath", name: "Bucket & Bowl Bath", cat: "Bathroom", price: 0, w: 1, d: 1, h: 16, quality: 1, comfort: 0, color: "oklch(0.6 0.13 250)", shape: "bath", verb: "Bucket bath", use: { hygiene: 35, minutes: 20 } },
  { id: "toilet", name: "WC Toilet", cat: "Bathroom", price: 40000, w: 1, d: 1, h: 26, quality: 2, comfort: 2, color: "oklch(0.95 0.005 90)", shape: "seat", verb: "Use toilet", use: { hygiene: 12, happy: 2, minutes: 10 } },
  { id: "shower", name: "Glass Shower", cat: "Bathroom", price: 70000, w: 1, d: 1, h: 72, quality: 3, comfort: 4, color: "oklch(0.85 0.04 210)", shape: "tall", verb: "Shower", use: { hygiene: 55, happy: 3, minutes: 20 } },
  { id: "bathtub", name: "Marble Bathtub", cat: "Bathroom", price: 380000, w: 2, d: 1, h: 22, quality: 5, comfort: 10, color: "oklch(0.92 0.01 80)", shape: "bath", verb: "Long soak", use: { hygiene: 70, happy: 12, energy: 5, minutes: 60 } },
  // Comfort
  { id: "plastic_chair", name: "Plastic Chair", cat: "Comfort", price: 0, w: 1, d: 1, h: 20, quality: 1, comfort: 1, color: "oklch(0.92 0.01 90)", shape: "seat", verb: "Sit & rest", use: { energy: 5, minutes: 30 } },
  { id: "cushion_chair", name: "Ankara Armchair", cat: "Comfort", price: 35000, w: 1, d: 1, h: 26, quality: 2, comfort: 4, color: "oklch(0.6 0.15 40)", shape: "seat", verb: "Relax", use: { energy: 8, happy: 4, minutes: 30 } },
  { id: "sofa", name: "3-Seater Sofa", cat: "Comfort", price: 150000, w: 2, d: 1, h: 28, quality: 3, comfort: 8, color: "oklch(0.45 0.08 160)", shape: "seat", verb: "Lounge", use: { energy: 12, happy: 8, minutes: 45 } },
  { id: "leather_sofa", name: "Italian Leather Sectional", cat: "Comfort", price: 600000, w: 3, d: 1, h: 30, quality: 5, comfort: 15, color: "oklch(0.35 0.05 50)", shape: "seat", verb: "Unwind", use: { energy: 18, happy: 12, minutes: 45 } },
  // Entertainment
  { id: "radio", name: "Transistor Radio", cat: "Entertainment", price: 8000, w: 1, d: 1, h: 14, quality: 1, comfort: 1, color: "oklch(0.4 0.05 50)", shape: "box", verb: "Listen to radio", use: { happy: 6, minutes: 30 } },
  { id: "tv_small", name: "32\" Smart TV", cat: "Entertainment", price: 90000, w: 1, d: 1, h: 40, quality: 2, comfort: 3, color: "oklch(0.2 0.01 250)", shape: "tv", verb: "Watch Nollywood", use: { happy: 12, energy: 2, minutes: 90 } },
  { id: "tv_big", name: "65\" OLED Wall", cat: "Entertainment", price: 400000, w: 2, d: 1, h: 54, quality: 4, comfort: 6, color: "oklch(0.18 0.01 250)", shape: "tv", verb: "Watch the league", use: { happy: 20, social: 4, minutes: 120 } },
  { id: "console", name: "Game Console Set", cat: "Entertainment", price: 250000, w: 1, d: 1, h: 18, quality: 3, comfort: 3, color: "oklch(0.25 0.02 260)", shape: "box", verb: "Play FIFA online", use: { happy: 16, social: 6, energy: -5, minutes: 90 } },
  // Work
  { id: "study_table", name: "Study Table", cat: "Work", price: 30000, w: 1, d: 1, h: 28, quality: 2, comfort: 2, color: "oklch(0.6 0.07 65)", shape: "table", verb: "Study", use: { xp: 15, energy: -10, minutes: 120 } },
  { id: "bookshelf", name: "Bookshelf", cat: "Work", price: 55000, w: 1, d: 1, h: 64, quality: 2, comfort: 3, color: "oklch(0.5 0.07 50)", shape: "tall", verb: "Read", use: { xp: 10, happy: 3, minutes: 60 } },
  { id: "laptop_desk", name: "Laptop Workstation", cat: "Work", price: 280000, w: 2, d: 1, h: 30, quality: 4, comfort: 4, color: "oklch(0.3 0.02 250)", shape: "table", verb: "Freelance gig", use: { earn: 4500, xp: 20, energy: -15, hunger: -5, minutes: 180 } },
  // Decoration
  { id: "plant_pot", name: "Snake Plant", cat: "Decoration", price: 6000, w: 1, d: 1, h: 30, quality: 1, comfort: 2, color: "oklch(0.55 0.12 145)", shape: "plant" },
  { id: "adire_rug", name: "Adire Indigo Rug", cat: "Decoration", price: 25000, w: 2, d: 2, h: 2, quality: 2, comfort: 3, color: "oklch(0.4 0.12 260)", shape: "rug" },
  { id: "floor_lamp", name: "Brass Floor Lamp", cat: "Decoration", price: 22000, w: 1, d: 1, h: 60, quality: 2, comfort: 2, color: "oklch(0.78 0.12 85)", shape: "lamp" },
  { id: "wall_art", name: "Ankara Canvas Set", cat: "Decoration", price: 40000, w: 1, d: 1, h: 50, quality: 3, comfort: 3, color: "oklch(0.65 0.17 35)", shape: "tall" },
  { id: "aquarium", name: "Aquarium", cat: "Decoration", price: 180000, w: 2, d: 1, h: 40, quality: 3, comfort: 5, color: "oklch(0.7 0.1 210)", shape: "box", verb: "Feed the fish", use: { happy: 6, minutes: 15 } },
  // Luxury
  { id: "chandelier_set", name: "Crystal Lounge Set", cat: "Luxury", price: 900000, w: 2, d: 2, h: 24, quality: 5, comfort: 18, color: "oklch(0.85 0.08 85)", shape: "table" },
  { id: "bronze", name: "Bronze Head Replica", cat: "Luxury", price: 1500000, w: 1, d: 1, h: 56, quality: 5, comfort: 14, color: "oklch(0.55 0.1 60)", shape: "lamp", verb: "Admire", use: { happy: 8, rep: 1, minutes: 10 } },
  { id: "piano", name: "Grand Piano", cat: "Luxury", price: 2500000, w: 2, d: 2, h: 36, quality: 5, comfort: 20, color: "oklch(0.15 0.01 250)", shape: "table", verb: "Play piano", use: { happy: 25, rep: 2, minutes: 60 } },
  { id: "cinema", name: "Home Cinema Wall", cat: "Luxury", price: 3000000, w: 3, d: 1, h: 64, quality: 5, comfort: 24, color: "oklch(0.15 0.02 260)", shape: "tv", verb: "Host movie night", use: { happy: 30, social: 15, rep: 3, minutes: 150 } },
];
export const itemById = (id: string) => FURNITURE.find((f) => f.id === id);

// ---------- Places on the map ----------
export const PLACE_CATS = ["Food", "Jobs", "Homes", "Shopping", "Transport", "Health", "Government", "Events", "Ads"] as const;
export type PlaceCat = (typeof PLACE_CATS)[number];

export interface Place {
  id: string; name: string; cat: PlaceCat; district: DistrictId; x: number; y: number; desc: string;
  hours?: [number, number]; // open hours (24h), wraps past midnight
  activity?: Effect & { label: string; nin?: boolean };
}

export const PLACES: Place[] = [
  // Food
  { id: "mamaput_kubwa", name: "Iya Basira Mama Put", cat: "Food", district: "kubwa", x: 90, y: 55, desc: "Steaming rice, ofada stew and gist.", hours: [6, 22], activity: { label: "Eat rice & stew", cost: 1500, hunger: 35, happy: 2, social: 3, minutes: 30 } },
  { id: "akara_lugbe", name: "Roadside Akara & Pap", cat: "Food", district: "lugbe", x: 205, y: 625, desc: "Hot akara before sunrise.", hours: [5, 11], activity: { label: "Buy akara & pap", cost: 800, hunger: 20, happy: 1, minutes: 20 } },
  { id: "suya_wuse2", name: "Mallam Garba Suya", cat: "Food", district: "wuse2", x: 560, y: 315, desc: "The city's most argued-about suya.", hours: [17, 2], activity: { label: "Suya & cold zobo", cost: 3500, hunger: 25, happy: 10, social: 5, minutes: 40 } },
  { id: "bole_garki", name: "Area 11 Bole Joint", cat: "Food", district: "garki", x: 670, y: 495, desc: "Roasted plantain, fish and pepper sauce.", hours: [10, 22], activity: { label: "Bole & fish", cost: 2500, hunger: 30, happy: 5, minutes: 30 } },
  { id: "shawarma_utako", name: "Shawarma Republic", cat: "Food", district: "utako", x: 370, y: 355, desc: "Double sausage, extra cream.", hours: [11, 23], activity: { label: "Chicken shawarma", cost: 4000, hunger: 30, happy: 6, minutes: 25 } },
  { id: "fish_kado", name: "Kado Fish Market Grill", cat: "Food", district: "kado", x: 345, y: 310, desc: "Pick your catfish, watch it grill.", hours: [16, 24], activity: { label: "Grilled catfish", cost: 6000, hunger: 40, happy: 10, social: 6, minutes: 60 } },
  { id: "pepper_galadimawa", name: "Pepper Soup Corner", cat: "Food", district: "galadimawa", x: 380, y: 595, desc: "Goat meat pepper soup that clears sinuses.", hours: [12, 24], activity: { label: "Goat pepper soup", cost: 2500, hunger: 25, happy: 6, social: 4, minutes: 40 } },
  { id: "finedining_maitama", name: "Savanna Table", cat: "Food", district: "maitama", x: 590, y: 165, desc: "Tasting menu of modern Nigerian cuisine.", hours: [12, 23], activity: { label: "Fine dining", cost: 30000, hunger: 55, happy: 25, rep: 3, minutes: 90 } },
  // Shopping
  { id: "wuse_market", name: "Wuse Market", cat: "Shopping", district: "wuse", x: 455, y: 375, desc: "Fabrics, foodstuff, everything. Haggle hard.", hours: [7, 19], activity: { label: "Browse & haggle", cost: 1000, happy: 6, social: 6, energy: -5, minutes: 90 } },
  { id: "lakeside_mall", name: "Lakeside Mall", cat: "Shopping", district: "jabi", x: 275, y: 395, desc: "Cinema, food court, air conditioning.", hours: [9, 22], activity: { label: "Window shop & cinema", cost: 5000, happy: 18, social: 8, minutes: 180 } },
  { id: "gadget_plaza", name: "Crescent Gadget Plaza", cat: "Shopping", district: "wuse2", x: 530, y: 285, desc: "Phones, laptops and fairly-used everything.", hours: [9, 19], activity: { label: "Check new phones", cost: 0, happy: 3, minutes: 45 } },
  // Health
  { id: "jahi_hospital", name: "Jahi Specialist Hospital", cat: "Health", district: "jahi", x: 355, y: 200, desc: "Clean wards, long queues.", activity: { label: "Full check-up", cost: 5000, energy: 20, happy: 5, hygiene: 10, minutes: 120 } },
  { id: "garki_clinic", name: "Garki Family Clinic", cat: "Health", district: "garki", x: 640, y: 465, desc: "Quick consultations for the working crowd.", hours: [8, 20], activity: { label: "Quick consult", cost: 2500, energy: 10, happy: 3, minutes: 60 } },
  { id: "gym_lifecamp", name: "Life Camp Fitness Club", cat: "Health", district: "lifecamp", x: 255, y: 270, desc: "Treadmills and an outdoor pool.", hours: [5, 22], activity: { label: "Workout", cost: 3000, energy: -15, happy: 10, hygiene: -10, xp: 5, minutes: 90 } },
  // Government
  { id: "nin_centre", name: "Identity Enrolment Centre", cat: "Government", district: "cbd", x: 625, y: 395, desc: "Get your national ID number done.", hours: [8, 16], activity: { label: "Enrol for NIN", cost: 0, energy: -10, rep: 5, minutes: 180, nin: true } },
  { id: "assembly_area", name: "National Assembly area", cat: "Government", district: "asokoro", x: 765, y: 390, desc: "Watch the legislature from the visitors' gallery.", hours: [9, 15], activity: { label: "Visitors' gallery", cost: 0, happy: 4, xp: 10, minutes: 120 } },
  { id: "secretariat", name: "Federal Secretariat", cat: "Government", district: "cbd", x: 660, y: 400, desc: "Ministries in long concrete wings.", hours: [8, 16] },
  // Transport
  { id: "utako_park", name: "Utako Motor Park", cat: "Transport", district: "utako", x: 345, y: 385, desc: "Interstate buses and loud agberos." },
  { id: "kubwa_rail", name: "Kubwa Rail Station", cat: "Transport", district: "kubwa", x: 55, y: 90, desc: "Metro line into the city." },
  { id: "lugbe_airport_rd", name: "Airport Road Junction", cat: "Transport", district: "lugbe", x: 160, y: 660, desc: "Straight shot to the airport." },
  // Events (time-dependent)
  { id: "evt_jam", name: "Friday Night Jam", cat: "Events", district: "wuse2", x: 575, y: 290, desc: "Afrobeats, shisha and a live DJ.", hours: [20, 3], activity: { label: "Party", cost: 15000, happy: 28, social: 20, rep: 6, energy: -20, minutes: 180 } },
  { id: "evt_park", name: "Millennium Park Picnic", cat: "Events", district: "maitama", x: 615, y: 225, desc: "Families, frisbees and sunset photos.", hours: [8, 18], activity: { label: "Join the picnic", cost: 2000, happy: 18, social: 15, rep: 2, minutes: 150 } },
  { id: "evt_boat", name: "Jabi Lake Boat Ride", cat: "Events", district: "jabi", x: 230, y: 440, desc: "Paddle boats on the lake.", hours: [9, 19], activity: { label: "Boat ride", cost: 6000, happy: 20, social: 10, rep: 3, energy: -8, minutes: 120 } },
  { id: "evt_viewing", name: "Kubwa Viewing Centre", cat: "Events", district: "kubwa", x: 80, y: 40, desc: "Premier league on a big screen.", hours: [14, 23], activity: { label: "Watch the match", cost: 500, happy: 10, social: 12, rep: 1, minutes: 120 } },
  { id: "evt_gala", name: "Asokoro Charity Gala", cat: "Events", district: "asokoro", x: 840, y: 420, desc: "Black tie, big cheques.", hours: [19, 24], activity: { label: "Attend the gala", cost: 100000, happy: 30, social: 25, rep: 25, minutes: 240 } },
  { id: "evt_church", name: "National Christian Centre area", cat: "Events", district: "cbd", x: 690, y: 365, desc: "Sunday service and choir.", hours: [7, 13], activity: { label: "Attend service", cost: 0, happy: 10, social: 10, minutes: 150 } },
  { id: "evt_mosque", name: "National Mosque area", cat: "Events", district: "cbd", x: 600, y: 360, desc: "Jumu'ah prayers and quiet reflection.", hours: [5, 20], activity: { label: "Pray & reflect", cost: 0, happy: 10, social: 8, minutes: 90 } },
  // Wuse 2 nightlife & day life (fictional venues)
  { id: "cafe_wuse2", name: "Crescent Brew Café", cat: "Food", district: "wuse2", x: 520, y: 305, desc: "Flat whites, laptops and startup gist.", hours: [7, 20], activity: { label: "Coffee & remote work", cost: 2500, energy: 12, happy: 4, xp: 6, minutes: 60 } },
  { id: "resto_wuse2", name: "Adetokunbo Kitchen", cat: "Food", district: "wuse2", x: 550, y: 280, desc: "Upscale Nigerian plates for dates and deals.", hours: [11, 23], activity: { label: "Dinner for two vibes", cost: 12000, hunger: 45, happy: 16, social: 10, rep: 2, minutes: 75 } },
  { id: "lounge_wuse2", name: "Skyline 9 Rooftop Lounge", cat: "Events", district: "wuse2", x: 585, y: 310, desc: "City lights, small chops and smooth Afrobeats.", hours: [17, 3], activity: { label: "Chill on the rooftop", cost: 8000, happy: 18, social: 16, rep: 3, energy: -6, minutes: 120 } },
  { id: "club_wuse2", name: "Pulse Club", cat: "Events", district: "wuse2", x: 565, y: 325, desc: "DJ booth, VIP tables, the dance floor goes till dawn.", hours: [22, 5], activity: { label: "Hit the dance floor", cost: 10000, happy: 26, social: 22, rep: 5, energy: -22, hygiene: -10, minutes: 180 } },
  { id: "network_wuse2", name: "Crescent Tech Hub Mixer", cat: "Events", district: "wuse2", x: 535, y: 295, desc: "Founders, bankers and pitch decks after work.", hours: [17, 21], activity: { label: "Network & swap cards", cost: 0, social: 14, rep: 4, xp: 20, energy: -6, minutes: 90 } },
  // Ads (billboards)
  { id: "ad_motors", name: "AbujaMotors billboard", cat: "Ads", district: "mabushi", x: 455, y: 240, desc: "\"Drive what you deserve.\" Open AbujaMotors on your phone." },
  { id: "ad_homes", name: "AbujaHomes billboard", cat: "Ads", district: "jabi", x: 300, y: 430, desc: "\"Lake-view living from ₦1.2m.\" Open AbujaHomes." },
  { id: "ad_bank", name: "AbujaBank billboard", cat: "Ads", district: "garki", x: 690, y: 460, desc: "\"Your money, growing quietly.\" Open AbujaBank." },
];

// ---------- Delivery menu (AbujaEats) ----------
export const MENU = [
  { id: "jollof", name: "Party Jollof & Chicken", price: 3500, hunger: 40, happy: 8 },
  { id: "amala", name: "Amala, Ewedu & Gbegiri", price: 2800, hunger: 40, happy: 6 },
  { id: "tuwo", name: "Tuwo Shinkafa & Miyan Kuka", price: 2500, hunger: 40, happy: 5 },
  { id: "pounded", name: "Pounded Yam & Egusi", price: 4000, hunger: 50, happy: 8 },
  { id: "kilishi", name: "Kilishi & Malt", price: 3000, hunger: 15, happy: 10 },
  { id: "smallchops", name: "Small Chops Platter", price: 6000, hunger: 30, happy: 14 },
];
export const DELIVERY_FEE = 1000;

// ---------- Vehicles ----------
export const VEHICLES = [
  { id: "bicycle", name: "City Bicycle", price: 45000, fare: 0, time: 1.4, rep: 0, desc: "Cheap, healthy and very Abuja-in-the-morning." },
  { id: "okada", name: "Motorbike", price: 650000, fare: 0.3, time: 0.7, rep: 2, desc: "Fast through traffic; weather matters." },
  { id: "tokunbo", name: "Tokunbo Saloon", price: 4500000, fare: 0.4, time: 0.6, rep: 10, desc: "Foreign-used saloon with working AC." },
  { id: "corolla", name: "Executive Saloon", price: 9500000, fare: 0.43, time: 0.52, rep: 22, desc: "Reliable executive transport for work and city life." },
  { id: "suv", name: "Executive SUV", price: 18000000, fare: 0.5, time: 0.48, rep: 40, desc: "Comfortable SUV for everyday Abuja movement." },
  { id: "range_rover", name: "Range Rover Autobiography", price: 165000000, fare: 0.65, time: 0.34, rep: 180, desc: "Flagship luxury SUV with serious status." },
  { id: "g_wagon", name: "Mercedes-AMG G 63", price: 185000000, fare: 0.68, time: 0.32, rep: 200, desc: "High-profile luxury performance SUV." },
  { id: "maybach", name: "Mercedes-Maybach S-Class", price: 240000000, fare: 0.72, time: 0.3, rep: 240, desc: "Rear-seat executive luxury." },
  { id: "bentley", name: "Bentley Flying Spur", price: 320000000, fare: 0.75, time: 0.28, rep: 300, desc: "Ultra-luxury grand touring sedan." },
  { id: "rolls_royce", name: "Rolls-Royce Ghost", price: 520000000, fare: 0.8, time: 0.25, rep: 450, desc: "Peak prestige mobility." },
  { id: "helicopter", name: "Executive Helicopter", price: 1800000000, fare: 1.2, time: 0.12, rep: 800, desc: "Private rotorcraft for premium travel." },
  { id: "private_jet", name: "Light Private Jet", price: 6500000000, fare: 1.5, time: 0.08, rep: 1500, desc: "Private aviation for inter-city and VIP travel." },
];
export const vehicleById = (id: string) => VEHICLES.find((v) => v.id === id);

// ---------- Boutique ----------
export const OUTFITS = [
  { id: "street", name: "Street Fit", price: 8000, color: "oklch(0.45 0.05 250)" },
  { id: "ankara", name: "Ankara Two-piece", price: 15000, color: "oklch(0.6 0.17 35)" },
  { id: "kaftan", name: "Linen Kaftan", price: 20000, color: "oklch(0.9 0.02 85)" },
  { id: "corporate", name: "Corporate Suit", price: 60000, color: "oklch(0.25 0.03 260)" },
  { id: "agbada", name: "Embroidered Agbada", price: 90000, color: "oklch(0.55 0.1 160)" },
  { id: "senator", name: "Senator Wear", price: 45000, color: "oklch(0.35 0.06 160)" },
  { id: "asooke", name: "Aso-Oke Owambe Set", price: 150000, color: "oklch(0.7 0.13 82)" },
];
export const outfitById = (id: string) => OUTFITS.find((o) => o.id === id) ?? OUTFITS[1]!;

// ---------- Phone games ----------
export const PHONE_GAMES = [
  { id: "ludo", name: "Ludo King-ish", happy: 8, social: 4 },
  { id: "whot", name: "Whot! Cards", happy: 10, social: 2 },
  { id: "ayo", name: "Ayo Olopon", happy: 9, social: 3 },
];

export interface Background {
  id: string; name: string; story: string; cash: number; bank: number; perk: string; xp: number; rep: number;
}
export const BACKGROUNDS: Background[] = [
  { id: "graduate", name: "Fresh Graduate", story: "Certificate in hand, CV in every inbox.", cash: 25000, bank: 25000, perk: "+150 XP head start", xp: 150, rep: 0 },
  { id: "hustler", name: "Street Hustler", story: "Came from the village with grit, not gold.", cash: 40000, bank: 0, perk: "More cash on hand", xp: 0, rep: 5 },
  { id: "corper", name: "NYSC Corper", story: "Posted to Abuja. Allawee and big dreams.", cash: 33000, bank: 30000, perk: "+10 reputation", xp: 50, rep: 10 },
  { id: "returnee", name: "Japa Returnee", story: "Back from abroad with savings and stories.", cash: 20000, bank: 180000, perk: "Big bank balance", xp: 0, rep: 0 },
];
export const backgroundById = (id: string) => BACKGROUNDS.find((b) => b.id === id) ?? BACKGROUNDS[0]!;

// ---------- Character look (cosmetic, free to change) ----------
export const HAIRS = [
  { id: "fade", name: "Clean Fade" },
  { id: "low", name: "Low Cut" },
  { id: "afro", name: "Afro" },
  { id: "locs", name: "Locs" },
  { id: "braids", name: "Cornrow Braids" },
  { id: "bun", name: "Top Bun" },
  { id: "gele", name: "Gele Headwrap" },
] as const;
export const ACCESSORIES = [
  { id: "none", name: "None" },
  { id: "glasses", name: "Glasses" },
  { id: "chain", name: "Gold Chain" },
  { id: "beads", name: "Coral Beads" },
  { id: "earrings", name: "Gold Earrings" },
  { id: "fila", name: "Fila Cap" },
  { id: "watch", name: "Wristwatch" },
] as const;
export const HAIR_IDS = HAIRS.map((h) => h.id) as [string, ...string[]];
export const ACCESSORY_IDS = ACCESSORIES.map((a) => a.id) as [string, ...string[]];
export const FACES = [
  { id: "calm", name: "Calm" },
  { id: "bright", name: "Bright-eyed" },
  { id: "bold", name: "Bold brows" },
  { id: "beard", name: "Beard" },
  { id: "dimples", name: "Dimples" },
] as const;
export const SHOES = [
  { id: "sneakers", name: "Sneakers" },
  { id: "loafers", name: "Loafers" },
  { id: "palm", name: "Palm Slippers" },
  { id: "heels", name: "Heels" },
  { id: "boots", name: "Boots" },
] as const;
export const FACE_IDS = FACES.map((f) => f.id) as [string, ...string[]];
export const SHOE_IDS = SHOES.map((s) => s.id) as [string, ...string[]];
