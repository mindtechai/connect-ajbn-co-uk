// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { hasAppleMessageHandler, isIPad, isInsideNativeWrapper } from "./native-apple-signin";

const w = window as Window & { webkit?: unknown };
function setNav(platform: string, maxTouchPoints: number) {
  Object.defineProperty(navigator, "platform", { value: platform, configurable: true });
  Object.defineProperty(navigator, "maxTouchPoints", { value: maxTouchPoints, configurable: true });
}
afterEach(() => { delete w.webkit; setNav("", 0); });

describe("iPad / native wrapper detection", () => {
  it("detects iPad reporting MacIntel with touch", () => { setNav("MacIntel", 5); expect(isIPad()).toBe(true); });
  it("does not treat a real Mac (no touch) as iPad", () => { setNav("MacIntel", 0); expect(isIPad()).toBe(false); });
  it("detects the appleSignIn message handler", () => {
    w.webkit = { messageHandlers: { appleSignIn: { postMessage: () => {} } } };
    expect(hasAppleMessageHandler()).toBe(true);
    expect(isInsideNativeWrapper()).toBe(true);
  });
  it("iPad Safari (no webkit handlers) is not the native wrapper", () => {
    setNav("MacIntel", 5);
    expect(isInsideNativeWrapper()).toBe(false);
  });
  it("other WKWebViews without the appleSignIn handler are not the native wrapper", () => {
    w.webkit = { messageHandlers: { other: {} } };
    expect(isInsideNativeWrapper()).toBe(false);
  });
});
