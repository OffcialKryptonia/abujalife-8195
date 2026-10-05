/**
 * Destination model: a district is an experience (identity + people + activities + events + atmosphere),
 * not just a pin. Add a destination by adding one entry — districts without an entry get a sensible default.
 */
import { DISTRICTS, PLACES, districtById, type Place } from "./content";

export type Phase = "morning" | "afternoon" | "evening" | "night";
export type Weather = "clear" | "cloudy" | "rain" | "heavy_rain" | "harmattan";
export type SceneKind = "nightlife" | "lakeside" | "market" | "civic" | "residential" | "upscale";

export interface NpcProfile { name: string; role: string; line: string; outfit: string }
export interface PhaseState { mood: string; crowd: number; traffic: number; nightlife: number; ambient: string[] }
export interface Destination {
  id: string; name: string; district: string; subtitle: string; scene: SceneKind;
  identity: { purpose: string[]; atmosphere: string; description: string };
  arrivalLine: string; experiences: string[];
  npcProfiles: NpcProfile[];
  travelLines: string[];
  phases: Record<Phase, PhaseState>;
  feed: string[];
  signage: string[];
}

const WUSE2: Destination = {
  id: "wuse2", name: "Wuse 2", district: "wuse2", subtitle: "Central District · Nightlife", scene: "nightlife",
  identity: { purpose: ["Nightlife", "Food", "Social", "Business"], atmosphere: "Offices by day, rooftops and DJs by night.", description: "Aminu Kano Crescent never really sleeps. Startups, bankers, suya smoke and the loudest Friday nights in Abuja." },
  arrivalLine: "The city is already moving.",
  experiences: ["Eat", "Lounge", "Club", "Meet people", "Network", "Events"],
  npcProfiles: [
    { name: "Tolu", role: "Banker", line: "Long week. I need one cold drink and small chops.", outfit: "agbada" },
    { name: "Hauwa", role: "Fashion designer", line: "Saturday is All White at Pulse. You go dey?", outfit: "kaftan" },
    { name: "Emeka", role: "Startup founder", line: "We're hiring devs. Come to the mixer at the hub.", outfit: "casual" },
    { name: "Mallam Garba", role: "Suya master", line: "Fresh off the fire. Yaji go burn you small.", outfit: "kaftan" },
    { name: "DJ Kaycee", role: "DJ", line: "Tonight's set is pure Afrobeats and amapiano.", outfit: "casual" },
    { name: "Ngozi", role: "Influencer", line: "Lighting on this rooftop is everything. Photo?", outfit: "ankara" },
    { name: "Sani", role: "Security", line: "Oga, small queue at the club door. E go move.", outfit: "casual" },
  ],
  travelLines: ["Traffic dey Aminu Kano tonight. Better settle down.", "Driver: \"Wuse 2? Na there everybody dey go this evening.\"", "A G-Wagon blasting Asake slides past.", "Your phone buzzes: \"You dey come Skyline 9?\"", "Banex junction is jammed. Driver takes a back road."],
  phases: {
    morning: { mood: "Commuters, coffee and keke horns.", crowd: 55, traffic: 70, nightlife: 0, ambient: ["Office workers rush past with ID cards", "Akara seller setting up by the plaza"] },
    afternoon: { mood: "Lunch meetings and gadget hunting.", crowd: 65, traffic: 60, nightlife: 10, ambient: ["Phone sellers call out deals", "Bankers argue over jollof at lunch"] },
    evening: { mood: "Restaurants filling, lounges warming up.", crowd: 80, traffic: 85, nightlife: 55, ambient: ["Suya smoke drifts across the crescent", "Ride-hailing cars queue at the lounges"] },
    night: { mood: "Neon, DJs and luxury cars. Friday energy.", crowd: 92, traffic: 75, nightlife: 100, ambient: ["Bass thumps from Pulse Club", "Photographers flash by the rooftop entrance"] },
  },
  feed: ["Chris just sprayed ₦5,000 at Skyline 9", "Amaka is looking for a ride to Wuse 2", "Biggs is hosting a table at Pulse tonight", "Someone found a ₦2,000 suya deal at Mallam Garba"],
  signage: ["AMINU KANO CRES.", "PULSE", "SKYLINE 9", "SUYA", "CRESCENT HUB"],
};

const JABI: Partial<Destination> = {
  subtitle: "Lakeside · Leisure", scene: "lakeside",
  identity: { purpose: ["Leisure", "Dates", "Food", "Photos"], atmosphere: "Breeze off the lake, couples and boat rides.", description: "Walks by the water, mall cinema and sunset photos." },
  arrivalLine: "The lake breeze hits different.",
  travelLines: ["Leisure traffic around the mall roundabout.", "Driver: \"Jabi Lake today? Weather fine for am.\""],
  signage: ["JABI LAKE", "LAKESIDE MALL", "BOAT RIDES"],
};
const WUSE: Partial<Destination> = {
  subtitle: "Commerce District · Market", scene: "market",
  identity: { purpose: ["Shopping", "Hustle", "Bargains"], atmosphere: "Traders shouting, wheelbarrows, fabric everywhere.", description: "Wuse Market: haggle hard, find anything." },
  arrivalLine: "\"Customer! Come and see!\"",
  travelLines: ["Buses loading goods block the lane.", "Wheelbarrow boys weave through traffic."],
  signage: ["WUSE MARKET", "FABRICS", "FOODSTUFF"],
};
const CBD: Partial<Destination> = {
  subtitle: "Central Business District · Civic", scene: "civic",
  identity: { purpose: ["Faith", "Government", "Landmarks"], atmosphere: "Wide boulevards, quiet dignity around the National Mosque and Christian Centre.", description: "Ministries, worship and the heart of the capital." },
  arrivalLine: "The capital's heart, calm and wide.",
  travelLines: ["Wide roads, quiet traffic. Minarets ahead.", "A traffic warden waves you through."],
  signage: ["CBD", "FED. SECRETARIAT", "NATIONAL MOSQUE"],
};
const OVERRIDES: Record<string, Partial<Destination>> = { jabi: JABI, wuse: WUSE, cbd: CBD,
  maitama: { scene: "upscale", subtitle: "Diplomatic · Upscale" }, asokoro: { scene: "upscale", subtitle: "Diplomatic · Quiet" } };

const DEFAULT_PHASES: Destination["phases"] = {
  morning: { mood: "Neighbours heading to work.", crowd: 45, traffic: 55, nightlife: 0, ambient: ["Keke riders call for passengers"] },
  afternoon: { mood: "Errands and lunch spots.", crowd: 50, traffic: 45, nightlife: 5, ambient: ["Generators hum behind shops"] },
  evening: { mood: "Golden light, people heading home.", crowd: 60, traffic: 70, nightlife: 30, ambient: ["Suya grills light up the corner"] },
  night: { mood: "Quiet streets, late food.", crowd: 25, traffic: 25, nightlife: 25, ambient: ["Mai shai serving tea under a bulb"] },
};

export function destinationFor(id: string): Destination {
  if (id === "wuse2") return WUSE2;
  const d = districtById(id);
  const o = OVERRIDES[d.id] ?? {};
  return {
    id: d.id, name: d.name, district: d.id, subtitle: o.subtitle ?? "Neighbourhood", scene: o.scene ?? "residential",
    identity: o.identity ?? { purpose: ["Living", "Food"], atmosphere: d.tagline, description: d.tagline },
    arrivalLine: o.arrivalLine ?? d.tagline, experiences: ["Eat", "Explore", "Meet people"],
    npcProfiles: o.npcProfiles ?? [{ name: "Aisha", role: "Student", line: "This area is calm, I like it.", outfit: "ankara" }, { name: "Bayo", role: "Keke rider", line: "Where you dey go? I fit carry you.", outfit: "casual" }],
    travelLines: o.travelLines ?? ["The driver hums along to Fuji on the radio.", "Clear road for once. Thank God."],
    phases: o.phases ?? DEFAULT_PHASES, feed: o.feed ?? [`Someone just checked into ${d.name}`],
    signage: o.signage ?? [d.name.toUpperCase(), ...d.landmarks.map((l) => l.toUpperCase())],
  };
}

export const DESTINATIONS = DISTRICTS.map((d) => destinationFor(d.id));
export const placesIn = (id: string): Place[] => PLACES.filter((p) => p.district === id && p.activity);

/** Deterministic daily weather so every player sees the same sky. */
export function weatherFor(gameMinutes: number): Weather {
  const day = Math.floor(gameMinutes / 1440);
  const r = (Math.sin(day * 12.9898) * 43758.5453) % 1;
  const v = Math.abs(r);
  return v < 0.45 ? "clear" : v < 0.65 ? "cloudy" : v < 0.8 ? "harmattan" : v < 0.93 ? "rain" : "heavy_rain";
}
export const WEATHER_LABEL: Record<Weather, string> = { clear: "Clear", cloudy: "Cloudy", rain: "Rain", heavy_rain: "Heavy rain", harmattan: "Harmattan haze" };

export function liveState(dest: Destination, phase: Phase, weather: Weather, weekday: string) {
  const base = dest.phases[phase];
  const wet = weather === "rain" ? 0.8 : weather === "heavy_rain" ? 0.55 : 1;
  const weekend = weekday === "Fri" || weekday === "Sat" ? 1.15 : 1;
  const crowd = Math.min(100, Math.round(base.crowd * wet * (phase === "night" ? weekend : 1)));
  const traffic = Math.min(100, Math.round(base.traffic * (weather.includes("rain") ? 1.3 : 1)));
  const nightlife = Math.min(100, Math.round(base.nightlife * weekend * wet));
  const special = dest.id === "wuse2" && phase === "night" && weekday === "Fri" ? "Friday Afrobeats Night" : dest.id === "wuse2" && phase === "night" && weekday === "Sat" ? "Saturday Abuja All White" : dest.id === "wuse2" && phase === "night" && weekday === "Thu" ? "Thursday Industry Night" : dest.id === "cbd" && weekday === "Fri" && phase === "afternoon" ? "Jumu'ah at the National Mosque" : dest.id === "cbd" && weekday === "Sun" && phase === "morning" ? "Sunday service at the Christian Centre" : null;
  return { ...base, crowd, traffic, nightlife, special, weather };
}
