import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Ban, Flag, Heart, Home, MessageCircle, Repeat2, Send, UserPlus, UserCheck, ArrowLeft, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe, useProfiles, isOnline, type PublicProfile } from "@/hooks/use-player";
import { Avatar } from "@/components/game/ui";
import { districtById } from "@/game/content";
import { levelFromXp } from "@/game/rules";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ago = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  return s < 60 ? "now" : s < 3600 ? `${Math.floor(s / 60)}m` : s < 86400 ? `${Math.floor(s / 3600)}h` : `${Math.floor(s / 86400)}d`;
};

function useProfileMap() {
  const { data } = useProfiles();
  return useMemo(() => new Map((data ?? []).map((p) => [p.user_id, p])), [data]);
}

export function useBlocks() {
  const me = useMe();
  return useQuery({
    queryKey: ["blocks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blocks").select("blocked_id").eq("blocker_id", me.user_id);
      if (error) throw error;
      return new Set(data.map((b) => b.blocked_id));
    },
  });
}

export function useFollows() {
  const me = useMe();
  return useQuery({
    queryKey: ["follows"],
    queryFn: async () => {
      const { data, error } = await supabase.from("follows").select("*");
      if (error) throw error;
      return { following: new Set(data.filter((f) => f.follower_id === me.user_id).map((f) => f.followee_id)), followers: data.filter((f) => f.followee_id === me.user_id) };
    },
  });
}

export function useSocialActions() {
  const me = useMe();
  const qc = useQueryClient();
  const run = (fn: () => PromiseLike<{ error: unknown }>, keys: string[], ok?: string) =>
    fn().then(({ error }) => { if (error) toast.error("Couldn't do that. Try again."); else { if (ok) toast.success(ok); keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] })); } });
  return {
    follow: (id: string) => run(() => supabase.from("follows").insert({ follower_id: me.user_id, followee_id: id }), ["follows"], "Following"),
    unfollow: (id: string) => run(() => supabase.from("follows").delete().eq("follower_id", me.user_id).eq("followee_id", id), ["follows"]),
    block: (id: string) => run(() => supabase.from("blocks").insert({ blocker_id: me.user_id, blocked_id: id }), ["blocks", "posts"], "Blocked. You won't see them anymore."),
    unblock: (id: string) => run(() => supabase.from("blocks").delete().eq("blocker_id", me.user_id).eq("blocked_id", id), ["blocks", "posts"], "Unblocked"),
    report: (target: string | null, postId: string | null, reason: string) => run(() => supabase.from("reports").insert({ reporter_id: me.user_id, target_user: target, post_id: postId, reason }), [], "Report sent to AbujaFeed moderators."),
  };
}

function PostCard({ post, profiles, onOpen }: { post: FeedPost; profiles: Map<string, PublicProfile>; onOpen: (id: string) => void }) {
  const me = useMe();
  const qc = useQueryClient();
  const social = useSocialActions();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const author = profiles.get(post.user_id);
  const liked = post.post_likes.some((l) => l.user_id === me.user_id);
  const shared = post.shared ? profiles.get(post.shared.user_id) : null;
  const refresh = () => qc.invalidateQueries({ queryKey: ["posts"] });

  const toggleLike = async () => {
    const q = liked ? supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", me.user_id) : supabase.from("post_likes").insert({ post_id: post.id, user_id: me.user_id });
    await q; refresh();
  };
  const share = async () => {
    const { error } = await supabase.from("posts").insert({ user_id: me.user_id, body: "Reposted", shared_post_id: post.shared?.id ?? post.id });
    if (!error) { toast.success("Shared to your feed"); refresh(); }
  };
  const sendComment = async () => {
    if (!comment.trim()) return;
    const { error } = await supabase.from("post_comments").insert({ post_id: post.id, user_id: me.user_id, body: comment.trim().slice(0, 200) });
    if (!error) { setComment(""); refresh(); }
  };

  return (
    <article className="border-b px-4 py-3">
      <div className="flex gap-3">
        <button onClick={() => onOpen(post.user_id)}><Avatar name={author?.name ?? "?"} skin={author?.skin ?? "2"} size={38} /></button>
        <div className="min-w-0 flex-1">
          <p className="text-sm"><button onClick={() => onOpen(post.user_id)} className="font-semibold">{author?.name ?? "Abujan"}</button> <span className="text-xs text-muted-foreground">· {author ? districtById(author.district).name : ""} · {ago(post.created_at)}</span></p>
          {post.shared ? (
            <div className="mt-1 rounded-xl border p-2.5"><p className="text-xs font-semibold"><Repeat2 className="mr-1 inline size-3" />{shared?.name ?? "Abujan"}</p><p className="whitespace-pre-wrap text-sm">{post.shared.body}</p></div>
          ) : <p className="whitespace-pre-wrap text-sm">{post.body.split(/(#\w+)/g).map((part, i) => part.startsWith("#") ? <span key={i} className="font-semibold text-primary">{part}</span> : part)}</p>}
          <div className="mt-2 flex items-center gap-5 text-xs text-muted-foreground">
            <button onClick={toggleLike} className={cn("flex items-center gap-1", liked && "text-destructive")}><Heart className={cn("size-4", liked && "fill-current")} />{post.post_likes.length}</button>
            <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1"><MessageCircle className="size-4" />{post.post_comments.length}</button>
            <button onClick={share} className="flex items-center gap-1"><Repeat2 className="size-4" />Share</button>
            {post.user_id === me.user_id
              ? <button onClick={async () => { await supabase.from("posts").delete().eq("id", post.id); refresh(); }} className="ml-auto">Delete</button>
              : <button onClick={() => social.report(post.user_id, post.id, "Inappropriate post")} className="ml-auto" aria-label="Report post"><Flag className="size-3.5" /></button>}
          </div>
          {showComments && (
            <div className="mt-2 space-y-1.5">
              {post.post_comments.map((c) => <p key={c.id} className="rounded-lg bg-muted px-2.5 py-1.5 text-xs"><b>{profiles.get(c.user_id)?.name ?? "Abujan"}</b> {c.body}</p>)}
              <div className="flex gap-1.5"><Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Reply…" className="h-8 text-xs" maxLength={200} /><Button size="sm" onClick={sendComment}>Send</Button></div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

type FeedPost = { id: string; user_id: string; body: string; created_at: string; shared_post_id: string | null; post_likes: { user_id: string }[]; post_comments: { id: string; user_id: string; body: string; created_at: string }[]; shared?: { id: string; user_id: string; body: string } | null };

export function FeedApp({ openProfile }: { openProfile: (id: string) => void }) {
  const me = useMe();
  const qc = useQueryClient();
  const profiles = useProfileMap();
  const { data: blocks } = useBlocks();
  const { data: follows } = useFollows();
  const [tab, setTab] = useState<"all" | "following" | "activity">("all");
  const [body, setBody] = useState("");
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("id, user_id, body, created_at, shared_post_id, post_likes(user_id), post_comments(id, user_id, body, created_at)").order("created_at", { ascending: false }).limit(60);
      if (error) throw error;
      const byId = new Map(data.map((d) => [d.id, d]));
      return data.map((d) => ({ ...d, shared: d.shared_post_id ? byId.get(d.shared_post_id) ?? null : null })) as FeedPost[];
    },
  });
  const post = useMutation({
    mutationFn: async () => { const { error } = await supabase.from("posts").insert({ user_id: me.user_id, body: body.trim().slice(0, 280) }); if (error) throw error; },
    onSuccess: () => { setBody(""); qc.invalidateQueries({ queryKey: ["posts"] }); },
    onError: () => toast.error("Couldn't post."),
  });
  const visible = (posts ?? []).filter((p) => !blocks?.has(p.user_id) && (tab !== "following" || follows?.following.has(p.user_id) || p.user_id === me.user_id));
  const trends = useMemo(() => {
    const counts = new Map<string, number>();
    (posts ?? []).forEach((p) => (p.body.match(/#\w+/g) ?? []).forEach((t) => counts.set(t.toLowerCase(), (counts.get(t.toLowerCase()) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [posts]);
  const activity = useMemo(() => {
    const mine = (posts ?? []).filter((p) => p.user_id === me.user_id);
    const items = [
      ...mine.flatMap((p) => p.post_comments.filter((c) => c.user_id !== me.user_id).map((c) => ({ at: c.created_at, who: c.user_id, text: `commented: "${c.body}"` }))),
      ...(follows?.followers ?? []).map((f) => ({ at: f.created_at, who: f.follower_id, text: "started following you" })),
      ...mine.filter((p) => p.post_likes.length).map((p) => ({ at: p.created_at, who: p.post_likes[0]!.user_id, text: `${p.post_likes.length > 1 ? `and ${p.post_likes.length - 1} others ` : ""}liked your post` })),
    ];
    return items.sort((a, b) => b.at.localeCompare(a.at));
  }, [posts, follows, me.user_id]);

  return (
    <div>
      <div className="flex gap-1 border-b px-3 pt-1">
        {(["all", "following", "activity"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={cn("flex-1 border-b-2 py-2 text-xs font-bold capitalize", tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground")}>{t === "activity" ? <><Bell className="mr-1 inline size-3" />Activity</> : t}</button>)}
      </div>
      {tab === "activity" ? (
        <div className="divide-y">
          {activity.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No activity yet. Post something!</p>}
          {activity.map((a, i) => <button key={i} onClick={() => openProfile(a.who)} className="flex w-full gap-3 px-4 py-3 text-left text-sm"><Avatar name={profiles.get(a.who)?.name ?? "?"} skin={profiles.get(a.who)?.skin ?? "2"} size={32} /><span><b>{profiles.get(a.who)?.name ?? "Someone"}</b> {a.text} <span className="text-xs text-muted-foreground">· {ago(a.at)}</span></span></button>)}
        </div>
      ) : (
        <>
          <div className="border-b p-3">
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="What's happening in Abuja? Use #hashtags" maxLength={280} className="min-h-16 resize-none text-sm" />
            <div className="mt-2 flex items-center justify-between"><span className="text-[11px] text-muted-foreground">{body.length}/280</span><Button size="sm" disabled={!body.trim() || post.isPending} onClick={() => post.mutate()}>Post</Button></div>
          </div>
          <div className="border-b px-4 py-2.5">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Trending in Abuja</p>
            {trends.length ? <div className="flex flex-wrap gap-1.5">{trends.map(([t, n]) => <span key={t} className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">{t} · {n}</span>)}</div> : <p className="text-xs text-muted-foreground">Start a trend with a #hashtag.</p>}
          </div>
          {isLoading && <p className="p-6 text-center text-sm text-muted-foreground">Loading feed…</p>}
          {!isLoading && visible.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Quiet here. Be the first to post.</p>}
          {visible.map((p) => <PostCard key={p.id} post={p} profiles={profiles} onOpen={openProfile} />)}
        </>
      )}
    </div>
  );
}

export function PeopleApp({ openProfile }: { openProfile: (id: string) => void }) {
  const me = useMe();
  const { data } = useProfiles();
  const { data: blocks } = useBlocks();
  const [q, setQ] = useState("");
  const list = (data ?? []).filter((p) => p.user_id !== me.user_id && !blocks?.has(p.user_id) && p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="p-3"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Abujans" /></div>
      {list.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No other players found yet.</p>}
      {list.map((p) => (
        <button key={p.user_id} onClick={() => openProfile(p.user_id)} className="flex w-full items-center gap-3 border-b px-4 py-2.5 text-left">
          <div className="relative"><Avatar name={p.name} skin={p.skin} size={38} />{isOnline(p) && <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-success" />}</div>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{p.name}</p><p className="text-xs text-muted-foreground">LV {levelFromXp(p.xp)} · {districtById(p.district).name}</p></div>
        </button>
      ))}
    </div>
  );
}

export function ProfileView({ id, onMessage }: { id: string; onMessage: (id: string) => void }) {
  const me = useMe();
  const profiles = useProfileMap();
  const { data: follows } = useFollows();
  const { data: blocks } = useBlocks();
  const social = useSocialActions();
  const p = profiles.get(id);
  if (!p) return <p className="p-6 text-center text-sm text-muted-foreground">Player not found.</p>;
  const following = follows?.following.has(id);
  const isMe = id === me.user_id;
  return (
    <div className="p-4 text-center">
      <Avatar name={p.name} skin={p.skin} size={80} className="mx-auto" />
      <h2 className="mt-3 text-xl font-semibold">{p.name}</h2>
      <p className="text-sm text-muted-foreground">LV {levelFromXp(p.xp)} · {p.reputation} rep · {districtById(p.district).name}</p>
      <p className="text-xs text-muted-foreground">{isOnline(p) ? "Online now" : `Last seen ${ago(p.updated_at)} ago`} · {p.visits} home visits</p>
      {!isMe && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant={following ? "secondary" : "default"} onClick={() => (following ? social.unfollow(id) : social.follow(id))}>{following ? <><UserCheck className="size-4" />Following</> : <><UserPlus className="size-4" />Follow</>}</Button>
          <Button variant="secondary" onClick={() => onMessage(id)}><MessageCircle className="size-4" />Message</Button>
          <Link to="/play/visit/$userId" params={{ userId: id }} className="col-span-2 flex items-center justify-center gap-2 rounded-md border py-2 text-sm font-semibold"><Home className="size-4" />Visit their home</Link>
          {blocks?.has(id) ? <Button variant="outline" onClick={() => social.unblock(id)}>Unblock</Button> : <Button variant="outline" onClick={() => social.block(id)}><Ban className="size-4" />Block</Button>}
          <Button variant="outline" onClick={() => social.report(id, null, "Player behaviour")}><Flag className="size-4" />Report</Button>
        </div>
      )}
    </div>
  );
}

export function MessagesApp({ initialPeer }: { initialPeer?: string | null }) {
  const me = useMe();
  const qc = useQueryClient();
  const profiles = useProfileMap();
  const { data: blocks } = useBlocks();
  const { data: follows } = useFollows();
  const [peer, setPeer] = useState<string | null>(initialPeer ?? null);
  const [text, setText] = useState("");
  const { data: msgs } = useQuery({
    queryKey: ["messages"],
    refetchInterval: peer ? 6000 : 20000,
    queryFn: async () => {
      const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: true }).limit(500);
      if (error) throw error;
      return data;
    },
  });
  const convos = useMemo(() => {
    const m = new Map<string, { last: string; at: string }>();
    (msgs ?? []).forEach((x) => { const o = x.sender_id === me.user_id ? x.recipient_id : x.sender_id; m.set(o, { last: x.body, at: x.created_at }); });
    return [...m.entries()].filter(([id]) => !blocks?.has(id)).sort((a, b) => b[1].at.localeCompare(a[1].at));
  }, [msgs, me.user_id, blocks]);
  const send = async () => {
    if (!peer || !text.trim()) return;
    const { error } = await supabase.from("messages").insert({ sender_id: me.user_id, recipient_id: peer, body: text.trim().slice(0, 500) });
    if (error) toast.error("Message not delivered."); else { setText(""); qc.invalidateQueries({ queryKey: ["messages"] }); }
  };

  if (peer) {
    const thread = (msgs ?? []).filter((x) => (x.sender_id === peer && x.recipient_id === me.user_id) || (x.sender_id === me.user_id && x.recipient_id === peer));
    const pp = profiles.get(peer);
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b px-3 py-2"><button onClick={() => setPeer(null)} aria-label="Back"><ArrowLeft className="size-5" /></button><Avatar name={pp?.name ?? "?"} skin={pp?.skin ?? "2"} size={30} /><span className="text-sm font-semibold">{pp?.name ?? "Abujan"}</span></div>
        <div className="flex-1 space-y-1.5 overflow-y-auto p-3">
          {thread.length === 0 && <p className="text-center text-xs text-muted-foreground">Say hello 👋</p>}
          {thread.map((m) => <div key={m.id} className={cn("max-w-[80%] rounded-2xl px-3 py-1.5 text-sm", m.sender_id === me.user_id ? "ml-auto bg-primary text-primary-foreground" : "bg-muted")}>{m.body}</div>)}
        </div>
        <div className="flex gap-2 border-t p-2"><Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Message" maxLength={500} /><Button size="icon" onClick={send} aria-label="Send"><Send className="size-4" /></Button></div>
      </div>
    );
  }
  const suggestions = [...(follows?.following ?? [])].filter((id) => !convos.some(([c]) => c === id));
  return (
    <div>
      {convos.length === 0 && suggestions.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No chats yet. Follow people on AbujaFeed to message them.</p>}
      {convos.map(([id, c]) => (
        <button key={id} onClick={() => setPeer(id)} className="flex w-full items-center gap-3 border-b px-4 py-2.5 text-left">
          <Avatar name={profiles.get(id)?.name ?? "?"} skin={profiles.get(id)?.skin ?? "2"} size={40} />
          <div className="min-w-0 flex-1"><p className="flex justify-between text-sm font-semibold"><span>{profiles.get(id)?.name ?? "Abujan"}</span><span className="text-xs font-normal text-muted-foreground">{ago(c.at)}</span></p><p className="truncate text-xs text-muted-foreground">{c.last}</p></div>
        </button>
      ))}
      {suggestions.length > 0 && <p className="px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">People you follow</p>}
      {suggestions.map((id) => <button key={id} onClick={() => setPeer(id)} className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm"><Avatar name={profiles.get(id)?.name ?? "?"} skin={profiles.get(id)?.skin ?? "2"} size={32} />{profiles.get(id)?.name ?? "Abujan"}</button>)}
    </div>
  );
}
