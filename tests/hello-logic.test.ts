import { describe, it, expect } from "vitest";
import { makeGreeting } from "../src/hello-logic.js";

describe("makeGreeting", () => {
  it("uses default 'world' when who is missing", () => {
    const out = makeGreeting({});
    expect(out.greeting).toBe("hello, world!");
    expect(typeof out.at).toBe("string");
    expect(() => new Date(out.at).toISOString()).not.toThrow();
  });

  it("uses the provided who value", () => {
    const out = makeGreeting({ who: "video-factory" });
    expect(out.greeting).toBe("hello, video-factory!");
  });

  it("falls back to 'world' on whitespace-only who", () => {
    const out = makeGreeting({ who: "   " });
    expect(out.greeting).toBe("hello, world!");
  });

  it("produces an ISO timestamp close to now", () => {
    const before = Date.now();
    const out = makeGreeting({ who: "x" });
    const after = Date.now();
    const ts = new Date(out.at).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });
});