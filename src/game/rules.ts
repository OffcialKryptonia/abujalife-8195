// Pure game rules shared by client (display) and server (authority).
import {
  districtById, homeById, itemById, jobById, outfitById, vehicleById, HOMES, JOBS, MENU, DELIVERY_FEE,
  OUTFITS, PHONE_GAMES, PLACES, VEHICLES, DISTRICT_IDS, type DistrictId, type Effect,
} from "./content";

export interface FurnitureRow { u: string; i: string; x: number; y: number; r: number; p: boolean }

export interface PlayerState {
  name: string; district: string; outfit: string;
  cash: number; bank: number; usd_cash: number; usd_bank: number; game_money: number;
  hunger: number; energy: number; happiness: number; hygiene: number; social: number;
  xp: number; reputation: number; job_id: string | null; career_xp: number; shifts: number;
  home_id: string; game_minutes: number;
  furniture: FurnitureRow[]; vehicles: string[];
  last_challenge_day: number; invest_amount: number; invest_start: number; has_nin: boolean;
}

export type GameAction =
  | { type: "work" }
  | { type: "visit"; placeId: string }
  | { type: "order"; menuId: string }
  | { type: "travel"; to: DistrictId; vehicle?: string | undefined; mode?: TransportMode | undefined }
  | { type: "applyJob"; jobId: string }
  | { type: "quitJob" }
  | { type: "moveHome"; homeId: string }
  | { type: "deposit"; amount: number }
  | { type: "withdraw"; amount: number }
  | { type: "exchangeNairaToDollar"; amount: number }
  | { type: "exchangeDollarToNaira"; amount: number }
  | { type: "useItem"; uid: string }
  | { type: "buyItem"; itemId: string }
  | { type: "placeItem"; uid: string; x: number; y: number; r: number }
  | { type: "storeItem"; uid: string }
  | { type: "sellItem"; uid: string }
  | { type: "buyVehicle"; vehicleId: string }
  | { type: "buyOutfit"; outfitId: string }
  | { type: "claimChallenge" }
  | { type: "invest"; amount: number }
  | { type: "cashOut" }
  | { type: "playGame"; gameId: string };

export interface ActionResult {
  next: PlayerState;
  message: string;
  tx?: { amount: number; label: string; kind: string }[];
}

export class GameRuleError extends Error {}

export const levelFromXp = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1;
export const xpForLevel = (lvl: number) => (lvl - 1) ** 2 * 100;
export const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
export const formatNaira = (n: number) => "₦" + Math.round(n).toLocaleString("en-NG");
export const formatDollar = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
/** Default in-game FX rate; can be made admin-configurable through currency_settings. */
export const NGN_PER_USD = 1500;
export const convertNairaToDollar = (ngn: number) => Math.floor(ngn / NGN_PER_USD);
export const convertDollarToNaira = (usd: number) => Math.round(usd * NGN_PER_USD);

export function formatGameTime(minutes: number) {
  const day = Math.floor(minutes / 1440) + 1;
  const m = minutes % 1440;
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const phase = h >= 5 && h < 12 ? "morning" : h >= 12 && h < 17 ? "afternoon" : h >= 17 && h < 20 ? "evening" : "night";
  const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][(day - 1) % 7]!;
  return { day, clock: `${h12}:${mm} ${period}`, hour: h, phase: phase as "morning" | "afternoon" | "evening" | "night", weekday };
}

export const isOpen = (hours: [number, number] | undefined, hour: number) => {
  if (!hours) return true;
  const [a, b] = hours;
  return a < b ? hour >= a && hour < b : hour >= a || hour < b;
};

export function mood(s: Pick<PlayerState, "hunger" | "energy" | "happiness" | "hygiene" | "social">) {
  const avg = (s.hunger + s.energy + s.happiness + s.hygiene + s.social) / 5;
  if (avg >= 75) return { label: "Thriving", emoji: "😄", score: avg };
  if (avg >= 55) return { label: "Good", emoji: "🙂", score: avg };
  if (avg >= 35) return { label: "Meh", emoji: "😐", score: avg };
  return { label: "Struggling", emoji: "😩", score: avg };
}

export const TRANSPORT_MODES = ["taxi", "keke", "bus", "walk"] as const;
export type TransportMode = (typeof TRANSPORT_MODES)[number];
export const MODE_INFO: Record<TransportMode, { name: string; fare: number; time: number; energy: number; comfort: string }> = {
  taxi: { name: "Taxi", fare: 1, time: 1, energy: 3, comfort: "AC, quick, pricier" },
  keke: { name: "Keke", fare: 0.55, time: 1.25, energy: 5, comfort: "Breezy, cheap, bumpy" },
  bus: { name: "Bus", fare: 0.35, time: 1.6, energy: 6, comfort: "Cheapest, crowded" },
  walk: { name: "Walk", fare: 0, time: 3.2, energy: 14, comfort: "Free, tiring" },
};
export const travelCost = (from: string, to: string, vehicleId?: string, mode: TransportMode = "taxi") => {
  const a = districtById(from), b = districtById(to);
  const dist = Math.hypot(a.x - b.x, a.y - b.y);
  const base = { price: Math.round((300 + dist * 5) / 100) * 100, minutes: Math.round(15 + dist * 0.12) };
  const v = vehicleId ? vehicleById(vehicleId) : undefined;
  if (!v) { const m = MODE_INFO[mode]; return { price: Math.round((base.price * m.fare) / 100) * 100, minutes: Math.round(base.minutes * m.time) }; }
  return { price: Math.round((base.price * v.fare) / 100) * 100, minutes: Math.round(base.minutes * v.time) };
};

export const itemDims = (row: FurnitureRow) => {
  const it = itemById(row.i)!;
  return row.r % 2 === 0 ? { w: it.w, d: it.d } : { w: it.d, d: it.w };
};

export const homeComfort = (rows: FurnitureRow[]) =>
  rows.filter((r) => r.p).reduce((sum, r) => sum + (itemById(r.i)?.comfort ?? 0), 0);

export function fits(rows: FurnitureRow[], size: number, cand: FurnitureRow) {
  const { w, d } = itemDims(cand);
  if (cand.x < 0 || cand.y < 0 || cand.x + w > size || cand.y + d > size) return false;
  const candIt = itemById(cand.i)!;
  return rows.every((o) => {
    if (!o.p || o.u === cand.u) return true;
    const oIt = itemById(o.i)!;
    if (oIt.shape === "rug" || candIt.shape === "rug") return true; // rugs sit under furniture
    const od = itemDims(o);
    return cand.x + w <= o.x || o.x + od.w <= cand.x || cand.y + d <= o.y || o.y + od.d <= cand.y;
  });
}

export function findSpot(rows: FurnitureRow[], size: number, row: FurnitureRow): FurnitureRow | null {
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    for (const r of [0, 1]) {
      const c = { ...row, x, y, r, p: true };
      if (fits(rows, size, c)) return c;
    }
  }
  return null;
}

export const CHALLENGES = [
  { title: "Fresh & clean", desc: "Get hygiene to 80+", check: (s: PlayerState) => s.hygiene >= 80, cash: 3000, xp: 30 },
  { title: "Well fed", desc: "Get hunger to 85+", check: (s: PlayerState) => s.hunger >= 85, cash: 2500, xp: 25 },
  { title: "City explorer", desc: "Be in Central Area", check: (s: PlayerState) => s.district === "cbd", cash: 4000, xp: 40 },
  { title: "Saver", desc: "Hold ₦50,000+ in the bank", check: (s: PlayerState) => s.bank >= 50000, cash: 5000, xp: 35 },
  { title: "Social butterfly", desc: "Get social to 75+", check: (s: PlayerState) => s.social >= 75, cash: 3500, xp: 35 },
  { title: "Lakeside day", desc: "Be in Jabi", check: (s: PlayerState) => s.district === "jabi", cash: 4000, xp: 40 },
  { title: "Rested", desc: "Get energy to 90+", check: (s: PlayerState) => s.energy >= 90, cash: 2500, xp: 25 },
];
export const challengeForDay = (day: number) => CHALLENGES[day % CHALLENGES.length]!;

export const investValue = (s: Pick<PlayerState, "invest_amount" | "invest_start" | "game_minutes">) => {
  if (!s.invest_amount) return 0;
  const days = Math.max(0, (s.game_minutes - s.invest_start) / 1440);
  return Math.round(s.invest_amount * (1 + 0.03 * days));
};

const advance = (s: PlayerState, minutes: number): PlayerState => {
  const h = minutes / 60;
  return {
    ...s, game_minutes: s.game_minutes + minutes,
    hunger: clamp(s.hunger - h * 1.5), hygiene: clamp(s.hygiene - h * 1.2), social: clamp(s.social - h * 0.6),
  };
};

function applyEffect(s: PlayerState, e: Effect, label: string, kind: string): ActionResult {
  const cost = e.cost ?? 0;
  if (s.cash < cost) throw new GameRuleError("Not enough cash on hand.");
  if (e.energy && e.energy < 0 && s.energy < -e.energy) throw new GameRuleError("You're too tired for that.");
  const n = advance(s, e.minutes);
  const next: PlayerState = {
    ...n,
    cash: s.cash - cost + (e.earn ?? 0),
    hunger: clamp(n.hunger + (e.hunger ?? 0)),
    energy: clamp(s.energy + (e.energy ?? 0)),
    happiness: clamp(s.happiness + (e.happy ?? 0)),
    hygiene: clamp(n.hygiene + (e.hygiene ?? 0)),
    social: clamp(n.social + (e.social ?? 0)),
    xp: s.xp + (e.xp ?? 0),
    reputation: s.reputation + (e.rep ?? 0),
  };
  const tx = [];
  if (cost) tx.push({ amount: -cost, label, kind });
  if (e.earn) tx.push({ amount: e.earn, label, kind: "salary" });
  return { next, message: label, tx };
}

export function applyAction(s: PlayerState, a: GameAction, ctx: { uid: string } = { uid: "x" }): ActionResult {
  const level = levelFromXp(s.xp);
  const home = homeById(s.home_id);
  const hour = formatGameTime(s.game_minutes).hour;
  switch (a.type) {
    case "work": {
      const job = jobById(s.job_id);
      if (!job) throw new GameRuleError("You don't have a job yet. Check Jobs on your phone.");
      if (s.district !== job.district) throw new GameRuleError(`Your job is in ${districtById(job.district).name}. Travel there first.`);
      if (s.energy < job.energy) throw new GameRuleError("You're too tired to work. Rest first.");
      if (s.hunger < 15) throw new GameRuleError("You're too hungry to work. Eat something.");
      const pay = Math.round(job.pay * (1 + Math.min(s.shifts, 50) * 0.01));
      const n = advance(s, job.hours * 60);
      const next = { ...n, cash: s.cash + pay, energy: clamp(s.energy - job.energy), hunger: clamp(n.hunger - job.hunger), happiness: clamp(s.happiness - 3), social: clamp(n.social + 3), xp: s.xp + job.xp, career_xp: s.career_xp + job.xp, shifts: s.shifts + 1 };
      return { next, message: `Shift done at ${job.employer}. +${formatNaira(pay)}`, tx: [{ amount: pay, label: `${job.title} shift`, kind: "salary" }] };
    }
    case "visit": {
      const p = PLACES.find((x) => x.id === a.placeId);
      if (!p?.activity) throw new GameRuleError("Nothing to do here.");
      if (p.district !== s.district) throw new GameRuleError(`${p.name} is in ${districtById(p.district).name}. Travel there first.`);
      if (!isOpen(p.hours, hour)) throw new GameRuleError(`${p.name} is closed right now.`);
      if (p.activity.nin && s.has_nin) throw new GameRuleError("You already have your NIN.");
      const r = applyEffect(s, p.activity, `${p.activity.label} — ${p.name}`, "leisure");
      if (p.activity.nin) r.next.has_nin = true;
      return r;
    }
    case "order": {
      const m = MENU.find((x) => x.id === a.menuId);
      if (!m) throw new GameRuleError("Not on the menu.");
      return applyEffect(s, { cost: m.price + DELIVERY_FEE, hunger: m.hunger, happy: m.happy, minutes: 45 }, `AbujaEats: ${m.name}`, "food");
    }
    case "travel": {
      if (!DISTRICT_IDS.includes(a.to)) throw new GameRuleError("Unknown place.");
      if (a.to === s.district) throw new GameRuleError("You're already here.");
      if (a.vehicle && !s.vehicles.includes(a.vehicle)) throw new GameRuleError("You don't own that vehicle.");
      const mode = a.mode ?? "taxi";
      const t = travelCost(s.district, a.to, a.vehicle, mode);
      if (s.cash < t.price) throw new GameRuleError("Not enough cash for the trip.");
      const n = advance(s, t.minutes);
      const next = { ...n, district: a.to, cash: s.cash - t.price, energy: clamp(s.energy - (a.vehicle === "bicycle" ? 8 : a.vehicle ? 3 : MODE_INFO[mode].energy)) };
      const label = a.vehicle ? `Fuel to ${districtById(a.to).name}` : `${MODE_INFO[mode].name} to ${districtById(a.to).name}`;
      return { next, message: `Arrived in ${districtById(a.to).name}.`, tx: t.price ? [{ amount: -t.price, label, kind: "transport" }] : [] };
    }
    case "applyJob": {
      const job = JOBS.find((j) => j.id === a.jobId);
      if (!job) throw new GameRuleError("Job not found.");
      if (level < job.minLevel) throw new GameRuleError(`You need level ${job.minLevel} for this role.`);
      if (s.job_id === job.id) throw new GameRuleError("You already work here.");
      return { next: { ...advance(s, 60), job_id: job.id, shifts: 0 }, message: `Hired! You're now a ${job.title}.` };
    }
    case "quitJob": {
      if (!s.job_id) throw new GameRuleError("You're not employed.");
      return { next: { ...s, job_id: null, shifts: 0, happiness: clamp(s.happiness + 5) }, message: "You resigned. Time for something new." };
    }
    case "moveHome": {
      const h = HOMES.find((x) => x.id === a.homeId);
      if (!h) throw new GameRuleError("Listing not found.");
      if (h.id === s.home_id) throw new GameRuleError("You already live here.");
      if (level < h.minLevel) throw new GameRuleError(`Landlord wants level ${h.minLevel}+.`);
      if (s.cash + s.bank < h.rent) throw new GameRuleError("You can't afford this rent yet.");
      const fromBank = Math.min(s.bank, h.rent);
      const furniture = s.furniture.map((r) => (r.p && !fits([], h.size, r) ? { ...r, p: false } : r));
      const next = { ...advance(s, 120), bank: s.bank - fromBank, cash: s.cash - (h.rent - fromBank), home_id: h.id, district: h.district, furniture, happiness: clamp(s.happiness + 15), reputation: s.reputation + Math.round(h.prestige / 5) };
      return { next, message: `Welcome to your new home: ${h.name}!`, tx: h.rent ? [{ amount: -h.rent, label: `Rent — ${h.name}`, kind: "housing" }] : [] };
    }
    case "deposit":
    case "withdraw": {
      const amt = Math.floor(a.amount);
      if (!Number.isFinite(amt) || amt <= 0) throw new GameRuleError("Enter a valid amount.");
      if (a.type === "deposit") {
        if (amt > s.cash) throw new GameRuleError("Not enough cash.");
        return { next: { ...s, cash: s.cash - amt, bank: s.bank + amt }, message: `Deposited ${formatNaira(amt)}.`, tx: [{ amount: amt, label: "Bank deposit", kind: "bank" }] };
      }
      if (amt > s.bank) throw new GameRuleError("Insufficient bank balance.");
      return { next: { ...s, cash: s.cash + amt, bank: s.bank - amt }, message: `Withdrew ${formatNaira(amt)}.`, tx: [{ amount: -amt, label: "Bank withdrawal", kind: "bank" }] };
    }
    case "exchangeNairaToDollar": {
      const amt = Math.floor(a.amount);
      if (!Number.isFinite(amt) || amt < NGN_PER_USD || amt > s.bank) throw new GameRuleError(`Use at least ${formatNaira(NGN_PER_USD)} from your bank.`);
      const usd = convertNairaToDollar(amt);
      if (usd < 1) throw new GameRuleError("Enter a larger naira amount.");
      const used = usd * NGN_PER_USD;
      return { next: { ...s, bank: s.bank - used, usd_bank: s.usd_bank + usd }, message: `Exchanged ${formatNaira(used)} for ${formatDollar(usd)}.`, tx: [{ amount: -used, label: `NGN→USD exchange (${formatDollar(usd)})`, kind: "fx" }] };
    }
    case "exchangeDollarToNaira": {
      const usd = Math.floor(a.amount);
      if (!Number.isFinite(usd) || usd <= 0 || usd > s.usd_bank) throw new GameRuleError("Insufficient dollar bank balance.");
      const ngn = convertDollarToNaira(usd);
      return { next: { ...s, usd_bank: s.usd_bank - usd, bank: s.bank + ngn }, message: `Exchanged ${formatDollar(usd)} for ${formatNaira(ngn)}.`, tx: [{ amount: ngn, label: `USD→NGN exchange (${formatDollar(usd)})`, kind: "fx" }] };
    }
    case "useItem": {
      const row = s.furniture.find((r) => r.u === a.uid && r.p);
      const it = row && itemById(row.i);
      if (!it?.use) throw new GameRuleError("You can't use that.");
      if (s.district !== home.district) throw new GameRuleError(`You're not at home. Head to ${districtById(home.district).name}.`);
      const bonus = it.cat === "Sleep" ? { happy: (it.use.happy ?? 0) + Math.floor(homeComfort(s.furniture) / 15) } : {};
      const r = applyEffect(s, { ...it.use, ...bonus }, `${it.verb ?? "Use"} — ${it.name}`, it.cat === "Kitchen" ? "food" : "home");
      return r;
    }
    case "buyItem": {
      const it = itemById(a.itemId);
      if (!it || it.price === 0) throw new GameRuleError("Item not for sale.");
      if (s.cash + s.bank < it.price) throw new GameRuleError("You can't afford this yet.");
      if (s.furniture.length >= 60) throw new GameRuleError("Your storage is full.");
      const fromBank = Math.min(s.bank, it.price);
      const spot = findSpot(s.furniture, home.size, { u: ctx.uid, i: it.id, x: 0, y: 0, r: 0, p: false });
      const row = spot ?? { u: ctx.uid, i: it.id, x: 0, y: 0, r: 0, p: false };
      return {
        next: { ...s, bank: s.bank - fromBank, cash: s.cash - (it.price - fromBank), furniture: [...s.furniture, row] },
        message: spot ? `${it.name} delivered and placed in your home.` : `${it.name} delivered to storage — no space to place it.`,
        tx: [{ amount: -it.price, label: `Bought ${it.name}`, kind: "furniture" }],
      };
    }
    case "placeItem": {
      const row = s.furniture.find((r) => r.u === a.uid);
      if (!row) throw new GameRuleError("Item not found.");
      const cand = { ...row, x: Math.floor(a.x), y: Math.floor(a.y), r: ((Math.floor(a.r) % 4) + 4) % 4, p: true };
      if (!fits(s.furniture, home.size, cand)) throw new GameRuleError("It doesn't fit there.");
      return { next: { ...s, furniture: s.furniture.map((r) => (r.u === a.uid ? cand : r)) }, message: `${itemById(row.i)!.name} placed.` };
    }
    case "storeItem": {
      const row = s.furniture.find((r) => r.u === a.uid);
      if (!row) throw new GameRuleError("Item not found.");
      return { next: { ...s, furniture: s.furniture.map((r) => (r.u === a.uid ? { ...r, p: false } : r)) }, message: "Moved to storage." };
    }
    case "sellItem": {
      const row = s.furniture.find((r) => r.u === a.uid);
      if (!row) throw new GameRuleError("Item not found.");
      const it = itemById(row.i)!;
      const value = Math.round(it.price * 0.5);
      return { next: { ...s, cash: s.cash + value, furniture: s.furniture.filter((r) => r.u !== a.uid) }, message: `Sold ${it.name} for ${formatNaira(value)}.`, tx: value ? [{ amount: value, label: `Sold ${it.name}`, kind: "furniture" }] : [] };
    }
    case "buyVehicle": {
      const v = VEHICLES.find((x) => x.id === a.vehicleId);
      if (!v) throw new GameRuleError("Vehicle not found.");
      if (s.vehicles.includes(v.id)) throw new GameRuleError("You already own one.");
      if (s.cash + s.bank < v.price) throw new GameRuleError("You can't afford this yet.");
      const fromBank = Math.min(s.bank, v.price);
      return { next: { ...s, bank: s.bank - fromBank, cash: s.cash - (v.price - fromBank), vehicles: [...s.vehicles, v.id], reputation: s.reputation + v.rep, happiness: clamp(s.happiness + 10) }, message: `Keys collected: ${v.name}!`, tx: [{ amount: -v.price, label: `Bought ${v.name}`, kind: "vehicle" }] };
    }
    case "buyOutfit": {
      const o = OUTFITS.find((x) => x.id === a.outfitId);
      if (!o) throw new GameRuleError("Outfit not found.");
      if (s.outfit === o.id) throw new GameRuleError("You're already wearing it.");
      if (s.cash < o.price) throw new GameRuleError("Not enough cash.");
      return { next: { ...advance(s, 30), cash: s.cash - o.price, outfit: o.id, happiness: clamp(s.happiness + 6) }, message: `Looking sharp in your ${outfitById(o.id).name}.`, tx: [{ amount: -o.price, label: o.name, kind: "shopping" }] };
    }
    case "claimChallenge": {
      const day = formatGameTime(s.game_minutes).day;
      if (s.last_challenge_day >= day) throw new GameRuleError("Today's challenge is already claimed.");
      const c = challengeForDay(day);
      if (!c.check(s)) throw new GameRuleError(`Not yet: ${c.desc}.`);
      return { next: { ...s, last_challenge_day: day, cash: s.cash + c.cash, xp: s.xp + c.xp }, message: `Challenge complete! +${formatNaira(c.cash)}`, tx: [{ amount: c.cash, label: `Daily challenge: ${c.title}`, kind: "reward" }] };
    }
    case "invest": {
      const amt = Math.floor(a.amount);
      if (!Number.isFinite(amt) || amt < 10000) throw new GameRuleError("Minimum investment is ₦10,000.");
      if (s.invest_amount) throw new GameRuleError("Cash out your current investment first.");
      if (amt > s.bank) throw new GameRuleError("Invest from your bank balance.");
      return { next: { ...s, bank: s.bank - amt, invest_amount: amt, invest_start: s.game_minutes }, message: `Invested ${formatNaira(amt)} in Savanna Treasury Notes.`, tx: [{ amount: -amt, label: "Treasury notes", kind: "invest" }] };
    }
    case "cashOut": {
      if (!s.invest_amount) throw new GameRuleError("No active investment.");
      const v = investValue(s);
      return { next: { ...s, bank: s.bank + v, invest_amount: 0, invest_start: 0 }, message: `Cashed out ${formatNaira(v)}.`, tx: [{ amount: v, label: "Treasury notes payout", kind: "invest" }] };
    }
    case "playGame": {
      const g = PHONE_GAMES.find((x) => x.id === a.gameId);
      if (!g) throw new GameRuleError("Game not found.");
      if (s.energy < 5) throw new GameRuleError("Too tired, even for games.");
      return applyEffect(s, { happy: g.happy, social: g.social, energy: -5, minutes: 30 }, `Played ${g.name}`, "leisure");
    }
  }
}
