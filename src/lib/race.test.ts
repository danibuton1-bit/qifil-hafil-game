import { describe, it, expect } from "vitest";
import { ease, fitZoom, leader, netColor } from "./race";

describe("network colour", () => {
  it("blue when good, yellow when fair, red when bad", () => {
    expect(netColor(80)).toBe("biru");
    expect(netColor(200)).toBe("kuning");
    expect(netColor(600)).toBe("merah");
    expect(netColor(null)).toBe("merah");
  });
});

describe("drone camera", () => {
  it("moves smoothly, not in one jump", () => {
    const n = ease(0, 100);
    expect(n).toBeGreaterThan(0);
    expect(n).toBeLessThan(100);
  });
  it("zoom out fits the whole level", () => {
    expect(fitZoom(3840, 1280)).toBeCloseTo(1 / 3);
    expect(fitZoom(800, 1280)).toBe(1);
  });
  it("follows key holder first, then the furthest player", () => {
    expect(leader([{ x: 900, key: false }, { x: 300, key: true }])).toBe(1);
    expect(leader([{ x: 200, key: false }, { x: 700, key: false }])).toBe(1);
    expect(leader([])).toBe(-1);
  });
});
