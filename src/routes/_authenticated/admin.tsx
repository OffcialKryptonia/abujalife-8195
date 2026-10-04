import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Activity, Banknote, Flag, LayoutDashboard, MessageSquare, Newspaper, Shield, Trash2, Users, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  checkAdmin, deletePost, getAdminOverview, listPlayers, listPosts, listReports, listTransactions, resolveReport, setRole, updatePlayer,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — AbujaLife" },
      { name: "description", content: "Manage AbujaLife players, economy, moderation and content." },
      { property: "og:title", content: "Admin Dashboard — AbujaLife" },
      { property: "og:description", content: "Manage AbujaLife players, economy, moderation and content." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const naira = (n: number) => "₦" + n.toLocaleString("en-NG");
const when = (s: string) => new Date(s).toLocaleString("en-NG", { dateStyle: "short", timeStyle: "short" });

function AdminPage() {
  const check = useServerFn(checkAdmin);
  const { data, isLoading } = useQuery({ queryKey: ["admin", "check"], queryFn: () => check() });
  if (isLoading) return <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">Checking access…</div>;
  if (!data?.isAdmin)
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
        <div>
          <Shield className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h1 className="font-display text-2xl font-bold">Admins only</h1>
          <p className="mt-1 text-muted-foreground">Your account doesn't have access to this area.</p>
          <Button asChild className="mt-4"><Link to="/play">Back to the game</Link></Button>
        </div>
      </div>
    );
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="font-display text-xl font-bold">AbujaLife Admin</h1>
          </div>
          <Button variant="ghost" size="sm" asChild><Link to="/play"><ArrowLeft className="mr-1 h-4 w-4" />Game</Link></Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Tabs defaultValue="overview">
          <TabsList className="mb-4 flex h-auto flex-wrap">
            <TabsTrigger value="overview"><LayoutDashboard className="mr-1 h-4 w-4" />Overview</TabsTrigger>
            <TabsTrigger value="players"><Users className="mr-1 h-4 w-4" />Players</TabsTrigger>
            <TabsTrigger value="reports"><Flag className="mr-1 h-4 w-4" />Reports</TabsTrigger>
            <TabsTrigger value="posts"><Newspaper className="mr-1 h-4 w-4" />Feed</TabsTrigger>
            <TabsTrigger value="economy"><Banknote className="mr-1 h-4 w-4" />Economy</TabsTrigger>
          </TabsList>
          <TabsContent value="overview"><Overview /></TabsContent>
          <TabsContent value="players"><Players /></TabsContent>
          <TabsContent value="reports"><Reports /></TabsContent>
          <TabsContent value="posts"><Posts /></TabsContent>
          <TabsContent value="economy"><Economy /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof Users }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="h-5 w-5" /></div>
        <div><div className="text-xs text-muted-foreground">{label}</div><div className="font-display text-xl font-bold">{value}</div></div>
      </CardContent>
    </Card>
  );
}

function Overview() {
  const fn = useServerFn(getAdminOverview);
  const { data } = useQuery({ queryKey: ["admin", "overview"], queryFn: () => fn(), refetchInterval: 30_000 });
  if (!data) return <p className="text-muted-foreground">Loading…</p>;
  const max = Math.max(1, ...Object.values(data.districts));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Players" value={data.players} icon={Users} />
        <Stat label="Online now" value={data.online} icon={Activity} />
        <Stat label="New (24h)" value={data.newPlayers} icon={Users} />
        <Stat label="Employed" value={data.employed} icon={Banknote} />
        <Stat label="Feed posts" value={data.posts} icon={Newspaper} />
        <Stat label="Messages" value={data.messages} icon={MessageSquare} />
        <Stat label="Open reports" value={data.openReports} icon={Flag} />
        <Stat label="Transactions (24h)" value={data.txDay} icon={Activity} />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Total money in economy: {naira(data.economy)}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm font-medium">Players by district</div>
          {Object.entries(data.districts).sort((a, b) => b[1] - a[1]).map(([d, n]) => (
            <div key={d} className="flex items-center gap-2 text-sm">
              <span className="w-24 capitalize">{d.replace(/_/g, " ")}</span>
              <div className="h-2 flex-1 rounded bg-muted"><div className="h-2 rounded bg-primary" style={{ width: `${(n / max) * 100}%` }} /></div>
              <span className="w-6 text-right">{n}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

type PlayerRow = Awaited<ReturnType<typeof listPlayers>>[number];

function Players() {
  const [search, setSearch] = useState("");
  const [edit, setEdit] = useState<PlayerRow | null>(null);
  const fn = useServerFn(listPlayers);
  const roleFn = useServerFn(setRole);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin", "players", search], queryFn: () => fn({ data: { search } }) });
  const role = useMutation({
    mutationFn: (v: { userId: string; role: "admin" | "moderator"; grant: boolean }) => roleFn({ data: v }),
    onSuccess: () => { toast.success("Role updated"); qc.invalidateQueries({ queryKey: ["admin", "players"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Players</CardTitle>
        <Input placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>District</TableHead><TableHead>Cash</TableHead><TableHead>Bank</TableHead><TableHead>XP</TableHead><TableHead>Job</TableHead><TableHead>Last seen</TableHead><TableHead>Roles</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {data?.map((p) => (
              <TableRow key={p.user_id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="capitalize">{p.district.replace(/_/g, " ")}</TableCell>
                <TableCell>{naira(p.cash)}</TableCell>
                <TableCell>{naira(p.bank)}</TableCell>
                <TableCell>{p.xp}</TableCell>
                <TableCell>{p.job_id ?? "—"}</TableCell>
                <TableCell className="whitespace-nowrap text-xs">{when(p.updated_at)}</TableCell>
                <TableCell className="space-x-1">{p.roles.map((r: string) => <Badge key={r} variant="secondary">{r}</Badge>)}</TableCell>
                <TableCell className="space-x-1 whitespace-nowrap">
                  <Button size="sm" variant="outline" onClick={() => setEdit(p)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => role.mutate({ userId: p.user_id, role: "moderator", grant: !p.roles.includes("moderator") })}>
                    {p.roles.includes("moderator") ? "Unmod" : "Mod"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => role.mutate({ userId: p.user_id, role: "admin", grant: !p.roles.includes("admin") })}>
                    {p.roles.includes("admin") ? "Unadmin" : "Admin"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {data?.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">No players found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
      {edit && <EditPlayer player={edit} onClose={() => setEdit(null)} />}
    </Card>
  );
}

function EditPlayer({ player, onClose }: { player: PlayerRow; onClose: () => void }) {
  const [v, setV] = useState({ cash: player.cash, bank: player.bank, xp: player.xp, reputation: player.reputation, reason: "Admin adjustment" });
  const fn = useServerFn(updatePlayer);
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: () => fn({ data: { userId: player.user_id, ...v } }),
    onSuccess: () => { toast.success("Player updated"); qc.invalidateQueries({ queryKey: ["admin"] }); onClose(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const num = (k: "cash" | "bank" | "xp" | "reputation") => (
    <div className="space-y-1"><Label className="capitalize">{k}</Label><Input type="number" value={v[k]} onChange={(e) => setV({ ...v, [k]: Math.trunc(Number(e.target.value) || 0) })} /></div>
  );
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit {player.name}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">{num("cash")}{num("bank")}{num("xp")}{num("reputation")}</div>
        <div className="space-y-1"><Label>Reason (shown in their bank history)</Label><Input value={v.reason} maxLength={80} onChange={(e) => setV({ ...v, reason: e.target.value })} /></div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>Save changes</Button>
      </DialogContent>
    </Dialog>
  );
}

function Reports() {
  const fn = useServerFn(listReports);
  const resolve = useServerFn(resolveReport);
  const del = useServerFn(deletePost);
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"open" | "all">("open");
  const { data } = useQuery({ queryKey: ["admin", "reports"], queryFn: () => fn() });
  const act = useMutation({
    mutationFn: async (a: { id: string; status: "resolved" | "dismissed" | "open"; postId?: string }) => {
      if (a.postId) await del({ data: { id: a.postId } });
      return resolve({ data: { id: a.id, status: a.status } });
    },
    onSuccess: () => { toast.success("Report updated"); qc.invalidateQueries({ queryKey: ["admin"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const rows = (data ?? []).filter((r) => filter === "all" || r.status === "open");
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Reports</CardTitle>
        <div className="space-x-1">
          <Button size="sm" variant={filter === "open" ? "default" : "outline"} onClick={() => setFilter("open")}>Open</Button>
          <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No reports here. Abuja is behaving.</p>}
        {rows.map((r) => (
          <div key={r.id} className="rounded-lg border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span><b>{r.reporter}</b> reported {r.target ? <b>{r.target}</b> : "a post"} · {when(r.created_at)}</span>
              <Badge variant={r.status === "open" ? "destructive" : "secondary"}>{r.status}</Badge>
            </div>
            <p className="mt-1 text-sm">Reason: {r.reason}</p>
            {r.postBody && <p className="mt-2 rounded bg-muted p-2 text-sm italic">“{r.postBody}”</p>}
            {r.status === "open" && (
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => act.mutate({ id: r.id, status: "dismissed" })}>Dismiss</Button>
                <Button size="sm" onClick={() => act.mutate({ id: r.id, status: "resolved" })}>Mark resolved</Button>
                {r.post_id && r.postBody && <Button size="sm" variant="destructive" onClick={() => act.mutate({ id: r.id, status: "resolved", postId: r.post_id! })}><Trash2 className="mr-1 h-4 w-4" />Remove post</Button>}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Posts() {
  const fn = useServerFn(listPosts);
  const del = useServerFn(deletePost);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin", "posts"], queryFn: () => fn() });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Post removed"); qc.invalidateQueries({ queryKey: ["admin"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">AbujaFeed posts</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {data?.length === 0 && <p className="text-sm text-muted-foreground">No posts yet.</p>}
        {data?.map((p) => (
          <div key={p.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground"><b className="text-foreground">{p.author}</b> · {when(p.created_at)}{p.shared_post_id && " · reshare"}</div>
              <p className="mt-1 break-words text-sm">{p.body}</p>
            </div>
            <Button size="icon" variant="ghost" aria-label="Remove post" onClick={() => confirm("Remove this post?") && remove.mutate(p.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Economy() {
  const fn = useServerFn(listTransactions);
  const { data } = useQuery({ queryKey: ["admin", "tx"], queryFn: () => fn() });
  const inflow = (data ?? []).filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const outflow = (data ?? []).filter((t) => t.amount < 0).reduce((a, t) => a + t.amount, 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Earned (recent 300)" value={naira(inflow)} icon={Banknote} />
        <Stat label="Spent (recent 300)" value={naira(Math.abs(outflow))} icon={Banknote} />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Recent transactions</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>When</TableHead><TableHead>Player</TableHead><TableHead>Label</TableHead><TableHead>Kind</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
            <TableBody>
              {data?.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="whitespace-nowrap text-xs">{when(t.created_at)}</TableCell>
                  <TableCell>{t.player}</TableCell>
                  <TableCell>{t.label}</TableCell>
                  <TableCell><Badge variant="outline">{t.kind}</Badge></TableCell>
                  <TableCell className={`text-right font-medium ${t.amount < 0 ? "text-destructive" : "text-primary"}`}>{naira(t.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
