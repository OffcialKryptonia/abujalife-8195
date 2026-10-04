// Static game content for AbujaLife. Pure data — no logic.

export type DistrictId =
  | "maitama" | "asokoro" | "wuse2" | "garki" | "jabi" | "gwarinpa" | "kubwa" | "lugbe";

export interface District {
  id: DistrictId;
  name: string;
  tier: 1 | 2 | 3 | 4; // 4 = most prestigious
  tagline: string;
  x: number; // map position, percent
  y: number;
  landmarks: string[];
}

export const DISTRICTS: District[] = [
  { id: "maitama", name: "Maitama", tier: 4, tagline: "Embassies, old money, quiet power.", x: 52, y: 22, landmarks: ["Transcorp Hilton", "Maitama Amusement Park"] },
  { id: "asokoro", name: "Asokoro", tier: 4, tagline: "Gated mansions near Aso Rock.", x: 78, y: 44, landmarks: ["Aso Rock View", "Asokoro Hospital"] },
  { id: "wuse2", name: "Wuse 2", tier: 3, tagline: "Nightlife, startups and Banex hustle.", x: 44, y: 40, landmarks: ["Banex Plaza", "Aminu Kano Crescent"] },
  { id: "garki", name: "Garki", tier: 2, tagline: "Banks, markets, ministries.", x: 60, y: 58, landmarks: ["Garki Market", "Area 11 Shoprite"] },
  { id: "jabi", name: "Jabi", tier: 3, tagline: "Lakeside malls and weekend vibes.", x: 30, y: 46, landmarks: ["Jabi Lake Mall", "Jabi Boat Club"] },
  { id: "gwarinpa", name: "Gwarinpa", tier: 2, tagline: "Africa's biggest estate. Family life.", x: 22, y: 26, landmarks: ["3rd Avenue", "Gwarinpa Estate"] },
  { id: "kubwa", name: "Kubwa", tier: 1, tagline: "Where most Abuja stories begin.", x: 10, y: 10, landmarks: ["Kubwa Village Market", "Arab Road"] },
  { id: "lugbe", name: "Lugbe", tier: 1, tagline: "Airport road grind, affordable rent.", x: 34, y: 82, landmarks: ["Airport Road", "Lugbe Market"] },
];

export const districtById = (id: string) => DISTRICTS.find((d) => d.id === id) ?? DISTRICTS[6];

export interface Job {
  id: string;
  title: string;
  employer: string;
  district: DistrictId;
  pay: number; // per shift, ₦
  energy: number;
  hunger: number;
  xp: number;
  minLevel: number;
  hours: number;
}

export const JOBS: Job[] = [
  { id: "keke", title: "Keke Rider", employer: "Kubwa Keke Union", district: "kubwa", pay: 6000, energy: 25, hunger: 15, xp: 20, minLevel: 1, hours: 6 },
  { id: "pos", title: "POS Agent", employer: "Arab Road Kiosk", district: "kubwa", pay: 5000, energy: 15, hunger: 10, xp: 18, minLevel: 1, hours: 6 },
  { id: "trader", title: "Market Trader", employer: "Lugbe Market", district: "lugbe", pay: 7000, energy: 22, hunger: 15, xp: 22, minLevel: 1, hours: 7 },
  { id: "suya", title: "Suya Spot Assistant", employer: "Mai Suya, Wuse 2", district: "wuse2", pay: 8000, energy: 20, hunger: 8, xp: 25, minLevel: 2, hours: 6 },
  { id: "csr", title: "Customer Service Rep", employer: "Jabi Lake Mall", district: "jabi", pay: 12000, energy: 18, hunger: 12, xp: 35, minLevel: 2, hours: 8 },
  { id: "creator", title: "Content Creator", employer: "Self-employed", district: "gwarinpa", pay: 10000, energy: 15, hunger: 10, xp: 40, minLevel: 2, hours: 5 },
  { id: "teller", title: "Bank Teller", employer: "Garki Commercial Bank", district: "garki", pay: 18000, energy: 20, hunger: 12, xp: 45, minLevel: 3, hours: 8 },
  { id: "nurse", title: "Nurse", employer: "Garki General Hospital", district: "garki", pay: 22000, energy: 30, hunger: 15, xp: 55, minLevel: 4, hours: 9 },
  { id: "dev", title: "Junior Developer", employer: "Banex Tech Hub", district: "wuse2", pay: 30000, energy: 22, hunger: 14, xp: 70, minLevel: 5, hours: 8 },
  { id: "realtor", title: "Real Estate Agent", employer: "Gwarinpa Homes", district: "gwarinpa", pay: 40000, energy: 25, hunger: 15, xp: 80, minLevel: 6, hours: 7 },
  { id: "civil", title: "Civil Servant", employer: "Federal Ministry", district: "asokoro", pay: 50000, energy: 15, hunger: 12, xp: 90, minLevel: 7, hours: 7 },
  { id: "lawyer", title: "Corporate Lawyer", employer: "Maitama Chambers", district: "maitama", pay: 90000, energy: 30, hunger: 18, xp: 130, minLevel: 9, hours: 10 },
];

export const jobById = (id: string | null | undefined) => JOBS.find((j) => j.id === id);

export interface Home {
  id: string;
  name: string;
  district: DistrictId;
  rent: number; // one-off move-in cost (annual rent), ₦
  restEnergy: number;
  restHappy: number;
  prestige: number;
  minLevel: number;
}

export const HOMES: Home[] = [
  { id: "kubwa_room", name: "Single Room, Kubwa", district: "kubwa", rent: 0, restEnergy: 45, restHappy: 2, prestige: 0, minLevel: 1 },
  { id: "lugbe_selfcon", name: "Self-Contain, Lugbe", district: "lugbe", rent: 120000, restEnergy: 55, restHappy: 5, prestige: 5, minLevel: 2 },
  { id: "gwarinpa_flat", name: "2-Bed Flat, Gwarinpa", district: "gwarinpa", rent: 450000, restEnergy: 65, restHappy: 8, prestige: 15, minLevel: 3 },
  { id: "jabi_apt", name: "Lake-View Apartment, Jabi", district: "jabi", rent: 1200000, restEnergy: 75, restHappy: 12, prestige: 30, minLevel: 5 },
  { id: "wuse_pent", name: "Penthouse, Wuse 2", district: "wuse2", rent: 3000000, restEnergy: 85, restHappy: 15, prestige: 50, minLevel: 7 },
  { id: "maitama_duplex", name: "Detached Duplex, Maitama", district: "maitama", rent: 8000000, restEnergy: 95, restHappy: 20, prestige: 80, minLevel: 9 },
  { id: "asokoro_mansion", name: "Mansion, Asokoro", district: "asokoro", rent: 20000000, restEnergy: 100, restHappy: 25, prestige: 120, minLevel: 11 },
];

export const homeById = (id: string) => HOMES.find((h) => h.id === id) ?? HOMES[0];

export interface Food {
  id: string;
  name: string;
  minTier: number;
  maxTier: number;
  price: number;
  hunger: number;
  happy: number;
}

export const FOODS: Food[] = [
  { id: "mamaput", name: "Mama Put Rice & Stew", minTier: 1, maxTier: 2, price: 1500, hunger: 35, happy: 2 },
  { id: "akara", name: "Akara & Pap", minTier: 1, maxTier: 2, price: 800, hunger: 20, happy: 1 },
  { id: "suya", name: "Suya & Cold Drink", minTier: 2, maxTier: 4, price: 3500, hunger: 25, happy: 10 },
  { id: "shawarma", name: "Chicken Shawarma", minTier: 2, maxTier: 3, price: 4000, hunger: 30, happy: 6 },
  { id: "bole", name: "Bole & Fish", minTier: 1, maxTier: 3, price: 2500, hunger: 30, happy: 5 },
  { id: "finedining", name: "Fine Dining", minTier: 4, maxTier: 4, price: 30000, hunger: 55, happy: 25 },
];

export const foodsForDistrict = (id: string) => {
  const t = districtById(id).tier;
  return FOODS.filter((f) => t >= f.minTier && t <= f.maxTier);
};

export interface Hangout {
  id: string;
  name: string;
  district: DistrictId;
  price: number;
  happy: number;
  rep: number;
  energy: number;
}

export const HANGOUTS: Hangout[] = [
  { id: "kubwa_viewing", name: "Football Viewing Centre", district: "kubwa", price: 500, happy: 10, rep: 1, energy: 5 },
  { id: "lugbe_joint", name: "Pepper Soup Joint", district: "lugbe", price: 2000, happy: 12, rep: 1, energy: 5 },
  { id: "jabi_lake", name: "Jabi Lake Boat Ride", district: "jabi", price: 6000, happy: 20, rep: 3, energy: 8 },
  { id: "wuse_club", name: "Wuse 2 Lounge Night", district: "wuse2", price: 15000, happy: 28, rep: 6, energy: 20 },
  { id: "garki_cinema", name: "Area 11 Cinema", district: "garki", price: 5000, happy: 18, rep: 2, energy: 6 },
  { id: "gwarinpa_park", name: "3rd Avenue Hangout", district: "gwarinpa", price: 3000, happy: 14, rep: 2, energy: 6 },
  { id: "maitama_hilton", name: "Hilton Pool Day", district: "maitama", price: 45000, happy: 35, rep: 12, energy: 10 },
  { id: "asokoro_gala", name: "Charity Gala", district: "asokoro", price: 100000, happy: 30, rep: 25, energy: 15 },
];

export interface Background {
  id: string;
  name: string;
  story: string;
  cash: number;
  bank: number;
  perk: string;
  xp: number;
  rep: number;
}

export const BACKGROUNDS: Background[] = [
  { id: "graduate", name: "Fresh Graduate", story: "Certificate in hand, CV in every inbox.", cash: 25000, bank: 25000, perk: "+150 XP head start", xp: 150, rep: 0 },
  { id: "hustler", name: "Street Hustler", story: "Came from the village with grit, not gold.", cash: 40000, bank: 0, perk: "More cash on hand", xp: 0, rep: 5 },
  { id: "corper", name: "NYSC Corper", story: "Posted to Abuja. Allawee and big dreams.", cash: 33000, bank: 30000, perk: "+10 reputation", xp: 50, rep: 10 },
  { id: "returnee", name: "Japa Returnee", story: "Back from abroad with savings and stories.", cash: 20000, bank: 180000, perk: "Big bank balance", xp: 0, rep: 0 },
];

export const backgroundById = (id: string) => BACKGROUNDS.find((b) => b.id === id) ?? BACKGROUNDS[0];
