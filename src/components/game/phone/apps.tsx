import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useGameAction, useMe, useTransactions } from "@/hooks/use-player";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "@/components/game/ui";
import { useBlocks, useSocialActions } from "./social";
import {
  backgroundById, DELIVERY_FEE, DISTRICTS, districtById, HOMES, homeById, JOBS, jobById, MENU, OUTFITS, outfitById,
  PHONE_GAMES, PLACES, VEHICLES, vehicleById, type DistrictId,
} from "@/game/content";
import { convertDollarToNaira, convertNairaToDollar, formatDollar, formatGameTime, formatNaira, homeComfort, investValue, isOpen, levelFromXp, mood, NGN_PER_USD, travelCost } from "@/game/rules";
import { getSoundPref, playRadio, radioPlaying, setSound, stopRadio } from "@/lib/sound";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const Row = ({ title, sub, right }: { title: React.ReactNode; sub?: React.ReactNode; right?: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-3 border-b px-4 py-3"><div className="min-w-0"><p className="text-sm font-semibold">{title}</p>{sub && <p className="text-xs text-muted-foreground">{sub}</p>}</div>{right}</div>
);
const Hero = ({ className, children }: { className?: string; children: React.ReactNode }) => <div className={cn("m-3 rounded-2xl p-4 text-surface-foreground", className ?? "bg-surface-gradient")}>{children}</div>;

export function JobsApp() {
  const p = useMe(); const act = useGameAction(); const level = levelFromXp(p.xp); const cur = jobById(p.job_id);
  return (
    <div>
      <Hero><p className="text-xs opacity-70">Current role</p><p className="font-display text-lg font-semibold">{cur ? `${cur.title} · ${cur.employer}` : "Unemployed"}</p>{cur && <p className="text-xs opacity-70">{p.shifts} shifts · +{Math.min(p.shifts, 50)}% loyalty bonus · {districtById(cur.district).name}</p>}
        {cur && <div className="mt-2 flex gap-2"><Button size="sm" variant="secondary" disabled={act.isPending || p.district !== cur.district} onClick={() => act.mutate({ type: "work" })}>{p.district === cur.district ? "Work shift" : "Travel to work first"}</Button><Button size="sm" variant="ghost" className="text-surface-foreground" onClick={() => act.mutate({ type: "quitJob" })}>Resign</Button></div>}
      </Hero>
      {JOBS.map((j) => <Row key={j.id} title={j.title} sub={`${j.employer} · ${districtById(j.district).name} · ${j.hours}h · LV${j.minLevel}`} right={<Button size="sm" variant={p.job_id === j.id ? "secondary" : "default"} disabled={act.isPending || level < j.minLevel || p.job_id === j.id} onClick={() => act.mutate({ type: "applyJob", jobId: j.id })}>{formatNaira(j.pay)}</Button>} />)}
    </div>
  );
}

export function BankApp() {
  const p = useMe();
  const act = useGameAction();
  const [amt, setAmt] = useState("5000");
  const [usd, setUsd] = useState("10");
  const tx = useTransactions();
  const n = Math.max(0, Number(amt) || 0);
  const u = Math.max(0, Number(usd) || 0);
  return <div>
    <Hero><p className="text-xs opacity-70">AbujaBank · Dual Currency</p><div className="grid grid-cols-2 gap-2"><div><p className="text-[10px] uppercase opacity-60">Naira bank</p><p className="font-display text-2xl font-semibold">{formatNaira(p.bank)}</p></div><div><p className="text-[10px] uppercase opacity-60">Dollar bank</p><p className="font-display text-2xl font-semibold">{formatDollar(p.usd_bank)}</p></div></div><p className="text-sm opacity-70">Cash: {formatNaira(p.cash)} · {formatDollar(p.usd_cash)}</p></Hero>
    <div className="px-4 pt-4"><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Naira ↔ Dollar</p><p className="mt-1 text-xs text-muted-foreground">In-game exchange rate: {formatNaira(NGN_PER_USD)} = $1</p><div className="mt-2 grid grid-cols-2 gap-2"><div className="rounded-xl border p-2"><input value={amt} onChange={e=>setAmt(e.target.value)} inputMode="numeric" className="h-9 w-full bg-transparent text-sm outline-none" placeholder="Naira amount"/><button className="mt-1 w-full rounded-lg bg-primary py-2 text-xs font-bold text-primary-foreground" disabled={act.isPending || n<NGN_PER_USD || n>p.bank} onClick={()=>act.mutate({type:"exchangeNairaToDollar",amount:n})}>Buy {formatDollar(convertNairaToDollar(n))}</button></div><div className="rounded-xl border p-2"><input value={usd} onChange={e=>setUsd(e.target.value)} inputMode="numeric" className="h-9 w-full bg-transparent text-sm outline-none" placeholder="Dollar amount"/><button className="mt-1 w-full rounded-lg bg-surface-foreground py-2 text-xs font-bold text-surface" disabled={act.isPending || u<1 || u>p.usd_bank} onClick={()=>act.mutate({type:"exchangeDollarToNaira",amount:u})}>Sell {formatNaira(convertDollarToNaira(u))}</button></div></div></div>
    <div className="mt-3 flex gap-2 px-3"><input value={amt} onChange={e=>setAmt(e.target.value)} inputMode="numeric" className="h-9 min-w-0 flex-1 rounded-xl border bg-background px-3 text-sm"/><Button size="sm" disabled={act.isPending || n<=0 || n>p.cash} onClick={()=>act.mutate({type:"deposit",amount:n})}>Deposit</Button><Button size="sm" variant="secondary" disabled={act.isPending || n<=0 || n>p.bank} onClick={()=>act.mutate({type:"withdraw",amount:n})}>Withdraw</Button></div>
    <div className="mt-3">{(tx.data ?? []).map((t:any)=><Row key={t.id} title={t.label} sub={`${new Date(t.created_at).toLocaleString("en-NG",{dateStyle:"medium",timeStyle:"short"})} · ${t.currency ?? "NGN"}`} right={<span className={cn("text-sm font-bold",t.amount>=0?"text-success":"text-destructive")}>{t.amount>=0?"+":""}{t.currency==="USD"?formatDollar(t.amount):formatNaira(t.amount)}</span>}/>)}</div>
  </div>;
}

export function RideApp() {
  const p = useMe(); const act = useGameAction(); const [veh, setVeh] = useState<string | undefined>();
  const list = DISTRICTS.filter((d) => d.id !== p.district).map((d) => ({ d, t: travelCost(p.district, d.id, veh) })).sort((a, b) => a.t.minutes - b.t.minutes);
  return (
    <div>
      <Hero className="bg-gold-gradient !text-gold-foreground"><p className="text-xs opacity-70">Pickup</p><p className="font-display text-lg font-semibold">{districtById(p.district).name}</p><p className="text-xs opacity-70">Where to? Fares include traffic.</p></Hero>
      {p.vehicles.length > 0 && <div className="flex gap-1.5 px-3 pb-2">{[undefined, ...p.vehicles].map((v) => <button key={v ?? "r"} onClick={() => setVeh(v)} className={cn("rounded-full border px-2.5 py-1 text-xs font-bold", veh === v && "bg-primary text-primary-foreground")}>{v ? vehicleById(v)?.name : "AbujaRide"}</button>)}</div>}
      {list.map(({ d, t }) => <Row key={d.id} title={d.name} sub={`${t.minutes} min · ${d.tagline}`} right={<Button size="sm" disabled={act.isPending || p.cash < t.price} onClick={() => act.mutate({ type: "travel", to: d.id as DistrictId, vehicle: veh })}>{t.price ? formatNaira(t.price) : "Go"}</Button>} />)}
    </div>
  );
}

export function HomesApp() {
  const p = useMe(); const act = useGameAction(); const level = levelFromXp(p.xp);
  return (
    <div>
      <Hero><p className="text-xs opacity-70">You live at</p><p className="font-display text-lg font-semibold">{homeById(p.home_id).name}</p><p className="text-xs opacity-70">Comfort score {homeComfort(p.furniture)} · Furniture moves with you</p></Hero>
      {HOMES.map((h) => <Row key={h.id} title={h.name} sub={`${h.size}×${h.size} interior · LV${h.minLevel} · +${Math.round(h.prestige / 5)} rep`} right={p.home_id === h.id ? <span className="text-xs font-bold text-primary">Home</span> : <Button size="sm" disabled={act.isPending || level < h.minLevel || p.cash + p.bank < h.rent} onClick={() => act.mutate({ type: "moveHome", homeId: h.id })}>{h.rent ? formatNaira(h.rent) : "Free"}</Button>} />)}
    </div>
  );
}

export function MotorsApp() {
  const p = useMe(); const act = useGameAction();
  return (
    <div>
      <Hero><p className="text-xs opacity-70">Your garage</p><p className="font-display text-lg font-semibold">{p.vehicles.length ? p.vehicles.map((v) => vehicleById(v)?.name).join(", ") : "Empty — you take rides"}</p></Hero>
      {VEHICLES.map((v) => <Row key={v.id} title={v.name} sub={`${v.desc} Fare ${Math.round(v.fare * 100)}% · speed ×${(1 / v.time).toFixed(1)}`} right={p.vehicles.includes(v.id) ? <span className="text-xs font-bold text-primary">Owned</span> : <Button size="sm" disabled={act.isPending || p.cash + p.bank < v.price} onClick={() => act.mutate({ type: "buyVehicle", vehicleId: v.id })}>{formatNaira(v.price)}</Button>} />)}
    </div>
  );
}

export function BoutiqueApp() {
  const p = useMe(); const act = useGameAction();
  return (
    <div className="grid grid-cols-2 gap-3 p-3">
      {OUTFITS.map((o) => (
        <div key={o.id} className="rounded-2xl border p-3 text-center">
          <svg viewBox="0 0 60 60" className="mx-auto h-20"><path d="M18 14 L30 10 L42 14 L52 24 L44 30 L42 26 L42 54 L18 54 L18 26 L16 30 L8 24 Z" style={{ fill: o.color }} /><path d="M26 11 L30 18 L34 11" fill="none" stroke="black" strokeOpacity="0.2" strokeWidth="2" /></svg>
          <p className="text-sm font-semibold">{o.name}</p>
          <Button size="sm" className="mt-2 w-full" variant={p.outfit === o.id ? "secondary" : "default"} disabled={act.isPending || p.outfit === o.id || p.cash < o.price} onClick={() => act.mutate({ type: "buyOutfit", outfitId: o.id })}>{p.outfit === o.id ? "Wearing" : formatNaira(o.price)}</Button>
        </div>
      ))}
    </div>
  );
}

export function HealthApp() {
  const p = useMe(); const m = mood(p);
  const stats = [["Hunger", p.hunger, "bg-hunger"], ["Energy", p.energy, "bg-energy"], ["Happiness", p.happiness, "bg-happy"], ["Social", p.social, "bg-social"], ["Hygiene", p.hygiene, "bg-hygiene"]] as const;
  return (
    <div>
      <Hero><p className="text-xs opacity-70">Wellbeing</p><p className="font-display text-2xl font-semibold">{m.emoji} {m.label} · {Math.round(m.score)}%</p></Hero>
      <div className="space-y-3 px-4">{stats.map(([l, v, c]) => <div key={l}><div className="mb-1 flex justify-between text-xs font-semibold"><span>{l}</span><span>{v}</span></div><div className="h-2 rounded-full bg-muted"><div className={cn("h-full rounded-full", c)} style={{ width: `${v}%` }} /></div></div>)}</div>
      <p className="px-4 pb-1 pt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Clinics & fitness</p>
      {PLACES.filter((x) => x.cat === "Health").map((x) => <Row key={x.id} title={x.name} sub={`${districtById(x.district).name} · ${x.activity?.label}`} right={<Link to="/play/map" search={{ place: x.id }} className="text-xs font-bold text-primary">Map</Link>} />)}
    </div>
  );
}

export function InvestApp() {
  const p = useMe(); const act = useGameAction(); const [amt, setAmt] = useState("");
  const val = investValue(p);
  return (
    <div>
      <Hero><p className="text-xs opacity-70">Savanna Treasury Notes · 3% per game day</p><p className="font-display text-2xl font-semibold">{p.invest_amount ? formatNaira(val) : "No active investment"}</p>{p.invest_amount > 0 && <p className="text-xs opacity-70">Principal {formatNaira(p.invest_amount)} · gain {formatNaira(val - p.invest_amount)}</p>}</Hero>
      {p.invest_amount ? <div className="px-3"><Button className="w-full" disabled={act.isPending} onClick={() => act.mutate({ type: "cashOut" })}>Cash out to bank</Button></div> : (
        <div className="flex gap-2 px-3"><Input type="number" placeholder="From bank, min ₦10,000" value={amt} onChange={(e) => setAmt(e.target.value)} /><Button disabled={act.isPending || !Number(amt)} onClick={() => act.mutate({ type: "invest", amount: Math.floor(Number(amt)) })}>Invest</Button></div>
      )}
      <p className="px-4 pt-3 text-xs text-muted-foreground">Bank balance: {formatNaira(p.bank)}. Returns grow with in-game time — work, sleep and live, then cash out.</p>
    </div>
  );
}

export function EatsApp() {
  const p = useMe(); const act = useGameAction();
  return (
    <div>
      <Hero className="bg-hunger"><p className="font-display text-lg font-semibold">Hungry? We deliver anywhere in Abuja.</p><p className="text-xs opacity-80">Delivery {formatNaira(DELIVERY_FEE)} · ~45 min</p></Hero>
      {MENU.map((m) => <Row key={m.id} title={m.name} sub={`+${m.hunger} hunger · +${m.happy} happy`} right={<Button size="sm" disabled={act.isPending || p.cash < m.price + DELIVERY_FEE} onClick={() => act.mutate({ type: "order", menuId: m.id })}>{formatNaira(m.price)}</Button>} />)}
    </div>
  );
}

export function EventsApp() {
  const p = useMe(); const hour = formatGameTime(p.game_minutes).hour;
  return <div>{PLACES.filter((x) => x.cat === "Events").map((x) => <Row key={x.id} title={x.name} sub={`${districtById(x.district).name} · ${x.hours?.[0]}:00–${(x.hours?.[1] ?? 0) % 24}:00 · ${x.activity?.cost ? formatNaira(x.activity.cost) : "Free"}`} right={<Link to="/play/map" search={{ place: x.id }} className={cn("rounded-full px-2.5 py-1 text-xs font-bold", isOpen(x.hours, hour) ? "bg-gold text-gold-foreground" : "bg-muted text-muted-foreground")}>{isOpen(x.hours, hour) ? "Live · Go" : "Later"}</Link>} />)}</div>;
}

const HEADLINES = [
  "Traffic builds on the Kubwa Expressway as commuters return to the city",
  "New lakeside walkway opens to weekend crowds at Jabi",
  "Rent in Gwarinpa climbs again, agents say demand is 'mad'",
  "Suya prices steady despite pepper scarcity, Wuse 2 vendors report",
  "Tech hub on Aminu Kano Crescent hiring junior developers",
  "Harmattan haze expected over the Aso Rock area this week",
  "Central Area roadworks: expect diversions near the Secretariat",
  "FCT Rangers win derby in front of packed stadium",
  "Lugbe market traders welcome new drainage project",
  "Identity enrolment centres extend opening hours",
  "Millennium Park to host free family picnic on Saturday",
  "Apo mechanics report boom in tokunbo car repairs",
];
export function NewsApp() {
  const day = formatGameTime(useMe().game_minutes).day;
  const items = Array.from({ length: 6 }, (_, i) => HEADLINES[(day * 5 + i * 7) % HEADLINES.length]!);
  return <div>{items.map((h, i) => <article key={i} className="border-b px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-widest text-primary">{["City", "Property", "Business", "Sports", "Weather", "Lifestyle"][i]} · Day {day}</p><p className="font-display text-sm font-semibold leading-snug">{h}</p></article>)}</div>;
}

const STATIONS = ["Capital FM 99.5 — Afrobeats", "Rock City Radio — Highlife", "Arewa Waves — Hausa pop", "Savanna Gospel 104"];
export function RadioApp() {
  const [on, setOn] = useState<number | null>(null);
  useEffect(() => { if (!radioPlaying()) setOn(null); return () => {}; }, []);
  return (
    <div>
      <Hero><p className="text-xs opacity-70">Now playing</p><p className="font-display text-lg font-semibold">{on === null ? "Radio off" : STATIONS[on]}</p></Hero>
      {STATIONS.map((s, i) => <Row key={s} title={s} right={<Button size="icon" variant={on === i ? "default" : "secondary"} aria-label={on === i ? "Pause" : "Play"} onClick={() => { if (on === i) { stopRadio(); setOn(null); } else { playRadio(i); setOn(i); } }}>{on === i ? <Pause className="size-4" /> : <Play className="size-4" />}</Button>} />)}
    </div>
  );
}

const TEAMS = ["FCT Rangers", "Wuse Warriors", "Garki United", "Jabi Lakers", "Kubwa Stars", "Asokoro Royals"];
export function SportsApp() {
  const day = formatGameTime(useMe().game_minutes).day;
  const games = (d: number) => [0, 1, 2].map((i) => { const a = TEAMS[(d + i * 2) % 6]!, b = TEAMS[(d + i * 2 + 1 + (d % 3)) % 6]!; return { a, b: a === b ? TEAMS[(d + 3) % 6]! : b, sa: (d * 7 + i * 3) % 4, sb: (d * 3 + i * 5) % 3 }; });
  return (
    <div>
      <p className="px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Yesterday · FCT League</p>
      {games(day - 1).map((g, i) => <Row key={i} title={`${g.a} ${g.sa} – ${g.sb} ${g.b}`} sub="Full time" />)}
      <p className="px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Today</p>
      {games(day).map((g, i) => <Row key={i} title={`${g.a} vs ${g.b}`} sub={`Kick-off ${16 + i}:00 · Watch at Kubwa Viewing Centre`} />)}
    </div>
  );
}

export function GamesApp() {
  const act = useGameAction(); const [roll, setRoll] = useState<number[] | null>(null);
  return (
    <div className="p-3">
      {roll && <div className="mb-3 flex justify-center gap-3 text-4xl">{roll.map((r, i) => <span key={i} className="grid size-14 place-items-center rounded-xl bg-card shadow-card">{"⚀⚁⚂⚃⚄⚅"[r - 1]}</span>)}</div>}
      {PHONE_GAMES.map((g) => <Row key={g.id} title={g.name} sub={`30 min · +${g.happy} happy · +${g.social} social`} right={<Button size="sm" disabled={act.isPending} onClick={() => { setRoll([1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]); act.mutate({ type: "playGame", gameId: g.id }); }}>Play</Button>} />)}
    </div>
  );
}

export function GovApp() {
  const p = useMe();
  return (
    <div>
      <Hero><p className="text-xs opacity-70">Citizen record</p><p className="font-display text-lg font-semibold">{p.name}</p><p className="text-sm">NIN: {p.has_nin ? "Verified ✓" : "Not enrolled"}</p></Hero>
      {!p.has_nin && <Row title="Enrol for your NIN" sub="Identity Enrolment Centre, Central Area · +5 rep" right={<Link to="/play/map" search={{ place: "nin_centre" }} className="text-xs font-bold text-primary">Go</Link>} />}
      {PLACES.filter((x) => x.cat === "Government").map((x) => <Row key={x.id} title={x.name} sub={x.desc} right={<Link to="/play/map" search={{ place: x.id }} className="text-xs font-bold text-primary">Map</Link>} />)}
    </div>
  );
}

export function PoliceApp() {
  const me = useMe(); const { data: blocks } = useBlocks(); const social = useSocialActions(); const [reason, setReason] = useState("");
  return (
    <div>
      <Hero className="bg-primary"><p className="font-display text-lg font-semibold">AbujaPolice · Community Safety</p><p className="text-xs opacity-80">Report abuse or harassment. Moderators review every report.</p></Hero>
      <div className="flex gap-2 px-3"><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Describe the issue" maxLength={200} /><Button disabled={!reason.trim()} onClick={() => { social.report(null, null, reason.trim()); setReason(""); }}>Report</Button></div>
      <p className="px-4 pb-1 pt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Blocked players ({blocks?.size ?? 0})</p>
      {[...(blocks ?? [])].map((id) => <Row key={id} title={id === me.user_id ? "You" : `Player ${id.slice(0, 6)}`} right={<Button size="sm" variant="outline" onClick={() => social.unblock(id)}>Unblock</Button>} />)}
    </div>
  );
}

export function SettingsApp() {
  const qc = useQueryClient(); const navigate = useNavigate(); const [sound, setS] = useState(false);
  useEffect(() => setS(getSoundPref()), []);
  return (
    <div>
      <Row title="Sound & ambience" sub="City hum and UI sounds" right={<Switch checked={sound} onCheckedChange={(v) => { setSound(v); setS(v); }} />} />
      <Row title="Data saver" sub="Map animations pause when 'Moving' filter is off" />
      <div className="p-4"><Button variant="outline" className="w-full" onClick={async () => { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); navigate({ to: "/auth", replace: true }); }}>Sign out</Button></div>
    </div>
  );
}

export function ProfileApp() {
  const p = useMe(); const net = p.cash + p.bank + investValue(p);
  const badges = [
    { name: "First Shift", got: p.career_xp > 0 }, { name: "Moved Up", got: p.home_id !== "kubwa_room" }, { name: "Interior Designer", got: homeComfort(p.furniture) >= 30 },
    { name: "On Wheels", got: p.vehicles.length > 0 }, { name: "Citizen", got: p.has_nin }, { name: "Half a Million", got: net >= 500000 },
    { name: "Known Face", got: p.reputation >= 50 }, { name: "Millionaire", got: net >= 1000000 },
  ];
  return (
    <div className="p-4 text-center">
      <Avatar name={p.name} skin={p.skin} size={80} className="mx-auto" />
      <h2 className="mt-3 text-xl font-semibold">{p.name}</h2>
      <p className="text-sm text-muted-foreground">{backgroundById(p.background).name} · {outfitById(p.outfit).name}</p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-left">{[["Level", levelFromXp(p.xp)], ["Rep", p.reputation], ["Net worth", formatNaira(net)], ["Days", formatGameTime(p.game_minutes).day], ["Shifts", p.shifts], ["Visits", p.visits]].map(([k, v]) => <div key={k} className="rounded-xl bg-muted p-2"><p className="text-[10px] text-muted-foreground">{k}</p><p className="truncate text-sm font-bold">{v}</p></div>)}</div>
      <div className="mt-4 flex flex-wrap justify-center gap-1.5">{badges.map((b) => <span key={b.name} className={b.got ? "rounded-full bg-gold-gradient px-3 py-1 text-xs font-semibold text-gold-foreground" : "rounded-full border px-3 py-1 text-xs text-muted-foreground"}>{b.name}</span>)}</div>
    </div>
  );
}

export function GameMoneyApp() {
  const [provider, setProvider] = useState<"korapay" | "pocketfi">("korapay");
  const [busy, setBusy] = useState(false);
  const [phone, setPhone] = useState("");
  const packs = [
    { id: "gm_1000", name: "Starter", price: 1000, money: 10000 },
    { id: "gm_5000", name: "Hustler", price: 5000, money: 55000 },
    { id: "gm_10000", name: "Executive", price: 10000, money: 120000 },
    { id: "gm_25000", name: "Tycoon", price: 25000, money: 325000 },
  ];
  const buy = async (productId: string) => {
    setBusy(true);
    try {
      const { createGameMoneyCheckout } = await import("@/lib/payment.functions");
      const result = await createGameMoneyCheckout({ data: { productId, provider, phone: phone || undefined } });
      if (!result.checkoutUrl) throw new Error(result.configured ? "Payment checkout was not returned." : `${provider === "korapay" ? "Korapay" : "PocketFi"} is not configured yet.`);
      window.location.href = result.checkoutUrl;
    } catch (e) { window.alert((e as Error).message); } finally { setBusy(false); }
  };
  return <div>
    <Hero className="bg-gradient-to-br from-primary to-surface"><p className="text-xs opacity-70">AbujaLife · Naira Wallet</p><p className="font-display text-2xl font-black">Top up your Naira</p><p className="mt-1 text-xs opacity-70">Real-money payments are verified server-side before value is credited.</p></Hero>
    <div className="flex gap-2 px-3 pb-3"><button onClick={()=>setProvider("korapay")} className={cn("flex-1 rounded-xl border px-3 py-2 text-xs font-black",provider==="korapay"&&"border-primary bg-primary/10")}>Korapay</button><button onClick={()=>setProvider("pocketfi")} className={cn("flex-1 rounded-xl border px-3 py-2 text-xs font-black",provider==="pocketfi"&&"border-primary bg-primary/10")}>PocketFi</button></div>
    {provider === "pocketfi" && <div className="px-3 pb-3"><Input inputMode="tel" placeholder="Phone number for PocketFi" value={phone} onChange={e=>setPhone(e.target.value)} /></div>}
    <div className="mx-3 mb-3 rounded-2xl border border-primary/20 bg-primary/5 p-3">\n      <div className="mb-2 flex items-center justify-between"><div><p className="text-xs font-bold">Transfer Game Money to your wallet</p><p className="text-[10px] text-muted-foreground">Convert Game Money into your own bank balance.</p></div><span className="text-xs font-black">{p.game_money.toLocaleString()} GM</span></div>\n      <div className="mb-2 grid grid-cols-2 gap-2"><button onClick={()=>setTransferCurrency("NGN")} className={cn("rounded-xl border px-3 py-2 text-xs font-black",transferCurrency==="NGN"&&"border-primary bg-primary/10")}>₦ NGN</button><button onClick={()=>setTransferCurrency("USD")} className={cn("rounded-xl border px-3 py-2 text-xs font-black",transferCurrency==="USD"&&"border-primary bg-primary/10")}>$ USD</button></div>\n      <div className="flex gap-2"><Input type="number" min="1" value={transferAmount} onChange={e=>setTransferAmount(e.target.value)} placeholder={transferCurrency==="NGN"?"Naira amount":"USD amount"} /><Button disabled={act.isPending || transferValue <= 0 || transferCost > p.game_money} onClick={()=>{ act.mutate({type:"transferGameMoney",amount:transferCost,currency:transferCurrency}); setTransferAmount(""); }}>Transfer</Button></div>\n      <p className="mt-1 text-[10px] text-muted-foreground">{transferCost.toLocaleString()} GM required · 10 GM = ₦1 · ₦{NGN_PER_USD.toLocaleString()} = $1</p>\n    </div>\n    {packs.map((pack)=> key={pack.id} title={<span>{pack.name} Pack</span>} sub={`${formatNaira(pack.price)} → ${formatNaira(pack.money)} in-game Naira`} right={<Button size="sm" disabled={busy} onClick={()=>buy(pack.id)}>Buy</Button>}/>)}
    <p className="px-4 py-3 text-[10px] leading-4 text-muted-foreground">AbujaLife uses two spendable currencies: Nigerian Naira (₦) and US Dollars ($). Real-money top-ups credit the Naira wallet; players can exchange between wallets at the in-game FX rate.</p>
  </div>;
}
