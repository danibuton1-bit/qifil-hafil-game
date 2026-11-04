import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/qifil-hafil-logo.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QIFIL DAN HAFIL - Main Berdua Online" },
      { name: "description", content: "Game kerja sama QIFIL & HAFIL. Main berdua online dari HP masing-masing." },
      { property: "og:title", content: "QIFIL DAN HAFIL" },
      { property: "og:description", content: "Main berdua online dari HP masing-masing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const DOTS = [
  { c: "#22c55e", l: "Online" },
  { c: "#f97316", l: "Hotspot" },
  { c: "#3b82f6", l: "Bluetooth" },
  { c: "#9ca3af", l: "Solo" },
];

function Home() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const u = () => setOnline(navigator.onLine);
    u();
    window.addEventListener("online", u); window.addEventListener("offline", u);
    return () => { window.removeEventListener("online", u); window.removeEventListener("offline", u); };
  }, []);

  return (
    <main className="pixel-page flex flex-col items-center justify-center">
      <div className="mb-3 flex flex-wrap justify-center gap-3 text-xs">
        {DOTS.map((d, i) => (
          <span key={d.l} className={`flex items-center gap-1 ${i === 0 && !online ? "opacity-40" : ""}`}>
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: d.c }} />{d.l}
          </span>
        ))}
      </div>
      <p className="mb-2 text-xs">{online ? "🟢 Kamu online" : "⚪ Kamu offline"}</p>
      <img src={logo} alt="QIFIL DAN HAFIL" className="w-full max-w-md rounded-xl" />
      <Link to="/lobby" className="pixel-btn mt-8 px-10">MAIN ▶</Link>
      <div className="mt-4 flex w-full max-w-xs flex-col gap-2">
        {online ? (
          <Link to="/lobby" className="pixel-btn">🟢 ONLINE - Mabar Pakai Internet</Link>
        ) : (
          <button disabled className="pixel-btn">🔒 ONLINE - Butuh Internet</button>
        )}
        <Link to="/hotspot" className="pixel-btn">🟠 MABAR HOTSPOT (OFFLINE)</Link>
        <Link to="/bluetooth" className="pixel-btn">🔵 MABAR BLUETOOTH (OFFLINE)</Link>
        <Link to="/solo" className="pixel-btn">⚪ MAIN SENDIRI - Bareng BOT</Link>
      </div>
    </main>
  );
}
