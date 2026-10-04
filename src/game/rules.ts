// Pure game rules shared by client (display) and server (authority).
import {
  districtById, foodsForDistrict, homeById, jobById, HANGOUTS, HOMES, JOBS, type DistrictId,
} from "./content";

export interface PlayerState {
  name: string;
  district: string;
  cash: number;
  bank: number;
  hunger: number;
  energy: number;
  happiness: number;
  xp: number;
  reputation: number;
  job_id: string | null;
  career_xp: number;
  shifts: number;
  home_id: string;
  game_minutes: number;
}

export type GameAction =
  | { type: "work" }
  | { type: "eat"; foodId: string }
  | { type: "rest" }
  | { type: "travel"; to: DistrictId }
  | { type: "applyJob"; jobId: string }
  | { type: "quitJob" }
  | { type: "moveHome"; homeId: string }
  | { type: "deposit"; amount: number }
  | { type: "withdraw"; amount: number }
  | { type: "hangout"; hangoutId: string };

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

export function formatGameTime(minutes: number) {
  const day = Math.floor(minutes / 1440) + 1;
  const m = minutes % 1440;
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return { day, clock: `${h12}:${mm} ${period}`, hour: h };
}

export const travelCost = (from: string, to: string) => {
  const a = districtById(from), b = districtById(to);
  const dist = Math.hypot(a.x - b.x, a.y - b.y);
  return { price: Math.round((300 + dist * 40) / 100) * 100, minutes: Math.round(15 + dist * 1.2) };
};

const advance = (s: PlayerState, minutes: number): PlayerState => {
  // Hunger slowly drops with time passing.
  const hungerDrop = minutes / 60 * 1.5;
  return { ...s, game_minutes: s.game_minutes + minutes, hunger: clamp(s.hunger - hungerDrop) };
};

export function applyAction(s: PlayerState, a: GameAction): ActionResult {
  const level = levelFromXp(s.xp);
  switch (a.type) {
    case "work": {
      const job = jobById(s.job_id);
      if (!job) throw new GameRuleError("You don't have a job yet. Check the job board.");
      if (s.district !== job.district) throw new GameRuleError(`Your job is in ${districtById(job.district).name}. Travel there first.`);
      if (s.energy < job.energy) throw new GameRuleError("You're too tired to work. Rest first.");
      if (s.hunger < 15) throw new GameRuleError("You're too hungry to work. Eat something.");
      const bonus = 1 + Math.min(s.shifts, 50) * 0.01;
      const pay = Math.round(job.pay * bonus);
      let next = advance(s, job.hours * 60);
      next = {
        ...next,
        cash: s.cash + pay,
        energy: clamp(s.energy - job.energy),
        hunger: clamp(next.hunger - job.hunger),
        happiness: clamp(s.happiness - 3),
        xp: s.xp + job.xp,
        career_xp: s.career_xp + job.xp,
        shifts: s.shifts + 1,
      };
      return { next, message: `Shift done at ${job.employer}. +${formatNaira(pay)}`, tx: [{ amount: pay, label: `${job.title} shift`, kind: "salary" }] };
    }
    case "eat": {
      const food = foodsForDistrict(s.district).find((f) => f.id === a.foodId);
      if (!food) throw new GameRuleError("That food isn't sold here.");
      if (s.cash < food.price) throw new GameRuleError("Not enough cash on hand.");
      let next = advance(s, 30);
      next = { ...next, cash: s.cash - food.price, hunger: clamp(next.hunger + food.hunger), happiness: clamp(s.happiness + food.happy) };
      return { next, message: `You enjoyed ${food.name}.`, tx: [{ amount: -food.price, label: food.name, kind: "food" }] };
    }
    case "rest": {
      const home = homeById(s.home_id);
      if (s.district !== home.district) throw new GameRuleError(`Your home is in ${districtById(home.district).name}. Go home to rest.`);
      let next = advance(s, 8 * 60);
      next = { ...next, energy: clamp(s.energy + home.restEnergy), happiness: clamp(s.happiness + home.restHappy) };
      return { next, message: `You slept at your ${home.name.split(",")[0]}. Feeling fresh.` };
    }
    case "travel": {
      if (a.to === s.district) throw new GameRuleError("You're already here.");
      const t = travelCost(s.district, a.to);
      if (s.cash < t.price) throw new GameRuleError("Not enough cash for the ride.");
      let next = advance(s, t.minutes);
      next = { ...next, district: a.to, cash: s.cash - t.price, energy: clamp(s.energy - 3) };
      return { next, message: `Arrived in ${districtById(a.to).name}.`, tx: [{ amount: -t.price, label: `Ride to ${districtById(a.to).name}`, kind: "transport" }] };
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
      const home = HOMES.find((h) => h.id === a.homeId);
      if (!home) throw new GameRuleError("Listing not found.");
      if (home.id === s.home_id) throw new GameRuleError("You already live here.");
      if (level < home.minLevel) throw new GameRuleError(`Landlord wants level ${home.minLevel}+.`);
      const total = s.cash + s.bank;
      if (total < home.rent) throw new GameRuleError("You can't afford this rent yet.");
      // Pay from bank first, then cash.
      const fromBank = Math.min(s.bank, home.rent);
      const next = { ...advance(s, 120), bank: s.bank - fromBank, cash: s.cash - (home.rent - fromBank), home_id: home.id, district: home.district, happiness: clamp(s.happiness + 15), reputation: s.reputation + Math.round(home.prestige / 5) };
      return { next, message: `Welcome to your new home: ${home.name}!`, tx: home.rent ? [{ amount: -home.rent, label: `Rent — ${home.name}`, kind: "housing" }] : [] };
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
    case "hangout": {
      const h = HANGOUTS.find((x) => x.id === a.hangoutId);
      if (!h) throw new GameRuleError("Spot not found.");
      if (h.district !== s.district) throw new GameRuleError("That spot isn't in this district.");
      if (s.cash < h.price) throw new GameRuleError("Not enough cash.");
      if (s.energy < h.energy) throw new GameRuleError("Too tired to go out.");
      let next = advance(s, 180);
      next = { ...next, cash: s.cash - h.price, happiness: clamp(s.happiness + h.happy), energy: clamp(s.energy - h.energy), reputation: s.reputation + h.rep, xp: s.xp + 10 };
      return { next, message: `Great time at ${h.name}. +${h.rep} rep`, tx: [{ amount: -h.price, label: h.name, kind: "leisure" }] };
    }
  }
}
