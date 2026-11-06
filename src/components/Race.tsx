import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/use-profile";
import { W, H, PW, PH, GY, levelAt, step, hazardCheck, touches, SKINS, type Body, type Input } from "@/lib/game";
import { raceSolids, netColor, NET_HEX } from "@/lib/race";

type Other = { id: string; name: string; x: number; y: number; key: boolean; ping: number | null; c: string; at: number };
const COLORS = Object.values(SKINS).map((s) => s.body);

export function Race({ room, slot, drone, level }: { room: string; slot: number; drone: boolean; level: number }) {
  const me = useProfile();
  const nav = useNavigate();
  const cv = useRef<HTMLCanvasElement>(null);
  const input = useRef<Input>({ left: false, right: false, up: false, down: false });
  const [win, setWin] = useState<string | null>(null);
  const [list, setList] = useState<Other[]>([]);

  useEffect(() => {
    if (!me) return;
    const L = levelAt(level);
    const solids = raceSolids(L);
    const others = new Map<string, Other>();
    const color = COLORS[slot % COLORS.length]!;
    let b: Body = { x: L.spawn[0] + slot * 10, y: L.spawn[1], vx: 0, vy: 0, onGround: false };
    let safe = { x: b.x, y: GY - PH };
    let key = false, done = false, ping: number | null = null, shield = 0, camX = 0, last = 0, raf = 0;
    const ch = supabase.channel(`race:${room}`, { config: { broadcast: { self: true } } });
    ch.on("broadcast", { event: "st" }, ({ payload }) => { if (payload.id !== me.id) others.set(payload.id, { ...payload, at: Date.now() }); })
      .on("broadcast", { event: "png" }, ({ payload }) => { if (payload.id === me.id) ping = Date.now() - payload.t; })
      .on("broadcast", { event: "win" }, ({ payload }) => { done = true; setWin(payload.name); })
      .subscribe();
    const pinger = setInterval(() => { if (!drone) void ch.send({ type: "broadcast", event: "png", payload: { id: me.id, t: Date.now() } }); }, 2000);
    const ui = setInterval(() => setList([...others.values()]), 1000);

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const i = input.current;
      if (drone) camX = Math.max(0, Math.min(L.width - W, camX + (i.left ? -12 : i.right ? 12 : 0)));
      else if (!done) {
        b = step(b, i, solids, L.width);
        if (b.onGround && solids.some((s) => s.y === b.y + PH && b.x + PW > s.x && b.x < s.x + s.w)) safe = { x: b.x, y: b.y };
        const d = hazardCheck(b, L.spikes, Date.now() < shield);
        if (d.dead) { b = { ...safe, vx: 0, vy: 0, onGround: true }; shield = Date.now() + 2500; }
        if (!key && touches(b, L.key.x, L.key.y)) key = true;
        if (key && touches(b, L.door.x + 20, L.door.y + 40, 50)) {
          done = true; setWin(me.username);
          void ch.send({ type: "broadcast", event: "win", payload: { name: me.username } });
        }
        camX = Math.max(0, Math.min(L.width - W, b.x - W / 3));
        if (t - last > 70) { last = t; void ch.send({ type: "broadcast", event: "st", payload: { id: me.id, name: me.username, x: b.x, y: b.y, key, ping, c: color } }); }
      }
      const g = cv.current?.getContext("2d"); if (!g) return;
      g.fillStyle = "#BFE6FF"; g.fillRect(0, 0, W, H);
      g.save(); g.translate(-camX, 0);
      g.fillStyle = "#8B5A2B"; for (const s of solids) g.fillRect(s.x, s.y, s.w, s.h);
      g.fillStyle = "#555"; for (const s of L.spikes) g.fillRect(s.x, s.y, s.w, s.h);
      g.fillStyle = "#7C3AED"; g.fillRect(L.door.x, L.door.y, 40, 80);
      if (!key) { g.font = "32px sans-serif"; g.fillText("🔑", L.key.x - 16, L.key.y + 12); }
      const draw = (x: number, y: number, c: string, name: string, k: boolean, p: number | null, stale: boolean) => {
        g.fillStyle = c; g.fillRect(x, y, PW, PH);
        g.fillStyle = "#000"; g.font = "bold 14px sans-serif"; g.textAlign = "center";
        g.fillText(`${name}${k ? " 🔑" : ""}`, x + PW / 2, y - 18);
        g.fillStyle = NET_HEX[stale ? "merah" : netColor(p)];
        g.beginPath(); g.arc(x + PW / 2, y - 8, 5, 0, 7); g.fill(); g.textAlign = "left";
      };
      for (const o of others.values()) draw(o.x, o.y, o.c, o.name, o.key, o.ping, Date.now() - o.at > 2000);
      if (!drone) draw(b.x, b.y, color, me.username, key, ping, false);
      g.restore();
      if (drone) { g.strokeStyle = "#EF4444"; g.lineWidth = 6; g.strokeRect(10, 10, W - 20, H - 20); g.fillStyle = "#EF4444"; g.font = "bold 24px sans-serif"; g.fillText("● LIVE  🎥 DRONE", 30, 50); }
    };
    raf = requestAnimationFrame(loop);
    const kd = (e: KeyboardEvent, v: boolean) => {
      const m: Record<string, keyof Input> = { ArrowLeft: "left", a: "left", ArrowRight: "right", d: "right", ArrowUp: "up", w: "up", " ": "up", ArrowDown: "down", s: "down" };
      const k = m[e.key]; if (k) input.current[k] = v;
    };
    const dn = (e: KeyboardEvent) => kd(e, true), up = (e: KeyboardEvent) => kd(e, false);
    window.addEventListener("keydown", dn); window.addEventListener("keyup", up);
    return () => { cancelAnimationFrame(raf); clearInterval(pinger); clearInterval(ui); supabase.removeChannel(ch); window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, [me, room, slot, drone, level]);

  const hold = (k: keyof Input, label: string) => (
    <button className="pixel-btn flex-1 select-none !py-3"
      onPointerDown={() => (input.current[k] = true)} onPointerUp={() => (input.current[k] = false)} onPointerLeave={() => (input.current[k] = false)}>{label}</button>
  );

  return (
    <main className="pixel-page flex flex-col items-center gap-2">
      <div className="flex w-full max-w-3xl items-center justify-between">
        <b className="font-pixel text-xs">🏁 TURNAMEN LEVEL {level}{drone ? " · 🎥 DRONE" : ""}</b>
        <button onClick={() => nav({ to: "/mabar" })} className="pixel-btn !py-1">← Keluar</button>
      </div>
      <canvas ref={cv} width={W} height={H} className="w-full max-w-3xl rounded-lg border-4 border-foreground" />
      <div className="flex w-full max-w-3xl gap-2">
        {hold("left", "◀")}{hold("right", "▶")}{!drone && hold("up", "▲ LOMPAT")}
      </div>
      <div className="pixel-card w-full max-w-3xl text-xs">
        <b>Pemain:</b>
        {list.length === 0 && <p>Menunggu pemain...</p>}
        {list.map((o) => {
          const c = Date.now() - o.at > 2000 ? "merah" : netColor(o.ping);
          return <p key={o.id}><span style={{ color: NET_HEX[c] }}>●</span> {o.name} {o.key ? "🔑" : ""} — {o.ping ?? "?"} ms</p>;
        })}
      </div>
      {win && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80">
          <div className="pixel-card text-center">
            <p className="font-pixel text-lg">🏆 {win} MENANG!</p>
            <button onClick={() => nav({ to: "/mabar" })} className="pixel-btn mt-3">KEMBALI KE MABAR</button>
          </div>
        </div>
      )}
    </main>
  );
}
