import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, BookOpen, Home, Users, BriefcaseBusiness, Trophy } from "lucide-react";
import { ABUJA_INSTITUTIONS } from "@/game/abuja-life";
import { useMe } from "@/hooks/use-player";
import { districtById } from "@/game/content";

export const Route = createFileRoute("/_authenticated/play/education")({ component: EducationScreen });
function EducationScreen() {
  const p = useMe();
  return <div className="space-y-4 pb-32">
    <div className="rounded-[28px] bg-gradient-to-br from-primary/20 via-surface to-surface p-5 shadow-xl">
      <div className="flex items-start gap-3"><div className="rounded-2xl bg-primary/15 p-3"><GraduationCap className="size-7 text-primary"/></div><div><p className="text-[10px] font-black uppercase tracking-[.24em] text-primary">Abuja education</p><h1 className="mt-1 text-2xl font-black">Study. Build. Belong.</h1><p className="mt-1 text-sm text-surface-foreground/60">Tertiary institutions are living environments—not just course menus.</p></div></div>
      <div className="mt-4 grid grid-cols-3 gap-2"><Mini icon={BookOpen} text="Classes"/><Mini icon={Home} text="Hostels"/><Mini icon={Users} text="Campus life"/></div>
    </div>
    <section className="space-y-2">
      {ABUJA_INSTITUTIONS.map((school) => <article key={school.id} className="glass rounded-2xl p-4"><div className="flex items-start justify-between gap-3"><div><span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-black uppercase text-primary">{school.ownership} · {school.type}</span><h2 className="mt-2 font-black">{school.name}</h2><p className="text-xs text-surface-foreground/55">{school.short} · {districtById(school.district as any).name}</p></div><div className="rounded-xl bg-surface-foreground/5 p-2"><GraduationCap className="size-5 text-primary"/></div></div><p className="mt-3 text-xs text-surface-foreground/65">{school.campus}</p><div className="mt-3 flex flex-wrap gap-1.5">{school.studentLife.map((x) => <span key={x} className="rounded-full border px-2 py-1 text-[10px] font-semibold">{x}</span>)}</div><div className="mt-4 grid grid-cols-3 gap-2"><Action icon={BookOpen} label="Attend class"/><Action icon={Home} label="Find hostel"/><Action icon={BriefcaseBusiness} label="Campus job"/></div></article>)}
    </section>
    <Link to="/play/map" className="block rounded-2xl bg-primary py-3 text-center text-sm font-black text-primary-foreground">Explore Abuja campuses on the map</Link>
  </div>;
}
function Mini({icon:Icon,text}:{icon:typeof BookOpen;text:string}){return <div className="rounded-xl bg-surface-foreground/5 p-2 text-center"><Icon className="mx-auto size-4 text-primary"/><p className="mt-1 text-[10px] font-bold">{text}</p></div>}
function Action({icon:Icon,label}:{icon:typeof BookOpen;label:string}){return <button className="rounded-xl bg-surface-foreground/5 px-2 py-2 text-left text-[10px] font-bold"><Icon className="mb-1 size-3 text-primary"/>{label}</button>}
