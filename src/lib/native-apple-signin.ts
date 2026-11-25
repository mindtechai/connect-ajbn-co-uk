// iOS-only native Sign in with Apple: Apple system sheet -> identityToken -> Supabase signInWithIdToken.
// Never uses signInWithOAuth, Safari or appleid.apple.com.
import { Capacitor, registerPlugin } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

type WebkitWindow = Window & { webkit?: { messageHandlers?: Record<string, unknown> } };

/** iPadOS reports a Mac desktop user agent ("MacIntel") in WKWebView/Safari; touch points reveal the iPad. */
export function isIPad() {
  if (typeof navigator === "undefined") return false;
  return /iPad/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

/** True when the native app exposes the WKWebView appleSignIn message handler. */
export function hasAppleMessageHandler() {
  if (typeof window === "undefined") return false;
  return !!(window as WebkitWindow).webkit?.messageHandlers?.["appleSignIn"];
}

/**
 * True inside the AJBN iPhone/iPad app (Capacitor or WKWebView wrapper).
 * Safari and other browsers never expose window.webkit.messageHandlers, so iPad Safari stays on web OAuth.
 */
export function isInsideNativeWrapper() {
  if (typeof window === "undefined") return false;
  try { if (Capacitor.isNativePlatform()) return true; } catch { /* not native */ }
  return !!(window as WebkitWindow).webkit?.messageHandlers;
}

export function isNativeIOS() {
  try {
    if (!Capacitor.isNativePlatform()) return false;
    // iPad in desktop content mode may not look like iOS; treat native + iPad as iOS too.
    return Capacitor.getPlatform() === "ios" || isIPad();
  } catch { return false; }
}

async function sha256Hex(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomNonce(len = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signInWithAppleNative() {
  // Native plugin is vendored in the iOS app (AppleSignInPlugin.swift); register by name only,
  // so no web/browser plugin code is ever bundled into the website.
  const SignInWithApple = registerPlugin<{
    authorize(o: { clientId: string; redirectURI: string; scopes: string; nonce: string }): Promise<{
      response: { identityToken: string; givenName?: string | null; familyName?: string | null };
    }>;
  }>("SignInWithApple");
  const rawNonce = randomNonce();
  const hashedNonce = await sha256Hex(rawNonce);
  const { response } = await SignInWithApple.authorize({
    clientId: "uk.co.ajbn.connect",
    redirectURI: "https://connect.ajbn.co.uk",
    scopes: "email name",
    nonce: hashedNonce,
  });
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: response.identityToken,
    nonce: rawNonce,
  });
  if (error) throw error;
  const given = response.givenName?.trim() || "";
  const family = response.familyName?.trim() || "";
  const uid = data.user?.id;
  if (uid && (given || family)) {
    const full = [given, family].filter(Boolean).join(" ");
    const patch: { first_name?: string; last_name?: string } = {};
    if (given) patch.first_name = given;
    if (family) patch.last_name = family;
    await supabase.from("profiles").update(patch).eq("id", uid);
    await supabase.auth.updateUser({ data: { full_name: full, given_name: given, family_name: family } });
  }
  return data;
}
