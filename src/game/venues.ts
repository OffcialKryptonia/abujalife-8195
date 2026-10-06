export type VenueMood = "dance" | "rooftop" | "cafe" | "kitchen" | "mixer";

export interface VenueExperience {
  id: string;
  name: string;
  address: string;
  mood: VenueMood;
  tagline: string;
  activityId: string;
  hours: [number, number];
  cast: { name: string; role: string; line: string }[];
}

/** Original, fictional Abuja venues built around the existing authoritative place activities. */
export const WUSE2_VENUES: VenueExperience[] = [
  {
    id: "club_wuse2", name: "Pulse Club", address: "Aminu Kano Crescent · Wuse 2", mood: "dance",
    tagline: "Afrobeats, amapiano and a dance floor under amber lights.", activityId: "club_wuse2", hours: [22, 5],
    cast: [{ name: "DJ Kaycee", role: "Resident DJ", line: "One more track, then we turn it up." }, { name: "Sani", role: "Door host", line: "Evening. Your people are already inside." }],
  },
  {
    id: "skyline_wuse2", name: "Skyline 9 Rooftop Lounge", address: "Wuse 2 · Upper terrace", mood: "rooftop",
    tagline: "City lights, small chops and the breeze off the crescent.", activityId: "lounge_wuse2", hours: [17, 3],
    cast: [{ name: "Ngozi", role: "Photographer", line: "Stand by the rail—the skyline is glowing." }, { name: "Tolu", role: "After-work regular", line: "This is the perfect place to decompress." }],
  },
  {
    id: "crescent_cafe", name: "Crescent Brew Café", address: "Aminu Kano Crescent · Wuse 2", mood: "cafe",
    tagline: "Coffee, laptop hum and easy startup gist.", activityId: "cafe_wuse2", hours: [7, 20],
    cast: [{ name: "Emeka", role: "Founder", line: "We should compare notes over coffee." }, { name: "Amina", role: "Barista", line: "Your usual? We have fresh ginger tea too." }],
  },
  {
    id: "adetokunbo_kitchen", name: "Adetokunbo Kitchen", address: "Wuse 2 · Crescent dining row", mood: "kitchen",
    tagline: "A relaxed table for Nigerian plates, stories and plans.", activityId: "resto_wuse2", hours: [11, 23],
    cast: [{ name: "Ifeoma", role: "Floor host", line: "Welcome in. The jollof just came off the fire." }, { name: "Tolu", role: "Regular", line: "Their pepper sauce is worth the trip." }],
  },
  {
    id: "crescent_mixer", name: "Crescent Tech Hub Mixer", address: "Wuse 2 · Innovation quarter", mood: "mixer",
    tagline: "Founders, designers and the next good idea in one room.", activityId: "network_wuse2", hours: [17, 21],
    cast: [{ name: "Emeka", role: "Community host", line: "What are you building these days?" }, { name: "Zainab", role: "Product designer", line: "I know someone who should hear your pitch." }],
  },
];

export const venueById = (id: string | undefined) => WUSE2_VENUES.find((venue) => venue.id === id);