// iOS-only native Sign in with Apple: Apple system sheet -> identityToken -> Supabase signInWithIdToken.
// Never uses signInWithOAuth, Safari or appleid.apple.com.
import { Capacitor, registerPlugin } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

export function isNativeIOS() {
  try { return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios"; } catch { return false; }
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
