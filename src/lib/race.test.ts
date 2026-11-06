import { describe, it, expect } from "vitest";
import { netColor } from "./race";

describe("network colour", () => {
  it("blue when good, yellow when fair, red when bad", () => {
    expect(netColor(80)).toBe("biru");
    expect(netColor(200)).toBe("kuning");
    expect(netColor(600)).toBe("merah");
    expect(netColor(null)).toBe("merah");
  });
});
