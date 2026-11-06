// Tournament race rules: everyone races the same level alone, first to grab the key and reach the door wins.
import { BOX, GY, type Level, type Rect } from "./game";

/** Network quality colour from round-trip time: blue good, yellow fair, red bad. */
export const netColor = (ms: number | null | undefined) =>
  ms == null || ms >= 400 ? "merah" : ms >= 150 ? "kuning" : "biru";
export const NET_HEX = { biru: "#3B82F6", kuning: "#FACC15", merah: "#EF4444" } as const;

/** Solid ground for a race: bridges are always out, boxes become a fixed step in front of their wooden block. */
export function raceSolids(l: Level): Rect[] {
  const s: Rect[] = [...l.platforms];
  for (const b of l.bridges) s.push({ x: b.x, y: GY, w: b.w, h: 20 });
  for (const b of l.boxes) if (b.color === "pink") s.push({ x: b.x + 300 - BOX, y: GY - BOX, w: BOX, h: BOX });
  return s;
}
