// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, act } from "@testing-library/react";
import { AppleSignInButton } from "./AppleSignInButton";

const mocks = vi.hoisted(() => ({
  oauth: vi.fn(), idToken: vi.fn(), update: vi.fn(), eq: vi.fn(), from: vi.fn(), pending: vi.fn(), toast: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: { signInWithOAuth: mocks.oauth, signInWithIdToken: mocks.idToken }, from: mocks.from,
} }));
vi.mock("@/lib/post-signin", () => ({ markOAuthPending: mocks.pending }));
vi.mock("@/hooks/use-toast", () => ({ toast: mocks.toast }));
const native = vi.hoisted(() => ({ isIOS: vi.fn(() => false), signIn: vi.fn() }));
vi.mock("@/lib/native-apple-signin", () => ({ isNativeIOS: native.isIOS, signInWithAppleNative: native.signIn }));

type Result = { error?: string; cancelled?: boolean; identityToken?: string; givenName?: string; familyName?: string };
const bridge = window as Window & {
  webkit?: { messageHandlers: { appleSignIn: { postMessage: (message: { nonce: string }) => void } } };
  __appleResult?: (result: Result) => Promise<void>;
};

function installHandler() {
  const postMessage = vi.fn();
  bridge.webkit = { messageHandlers: { appleSignIn: { postMessage } } };
  return postMessage;
}

async function respond(result: Result) {
  const callback = bridge.__appleResult;
  if (!callback) throw new Error("Native callback missing");
  await act(() => callback(result));
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.oauth.mockResolvedValue({ error: null });
  mocks.idToken.mockResolvedValue({ data: { user: { id: "apple-user" } }, error: null });
  mocks.from.mockReturnValue({ update: mocks.update });
  mocks.update.mockReturnValue({ eq: mocks.eq });
  mocks.eq.mockResolvedValue({ error: null });
});
afterEach(() => {
  cleanup();
  delete bridge.webkit;
  delete bridge.__appleResult;
});

describe("Apple sign-in bridge", () => {
  it("keeps OAuth when no native handler exists", async () => {
    render(<AppleSignInButton next="/complete-profile" />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(mocks.oauth).toHaveBeenCalledWith({ provider: "apple", options: {
      redirectTo: `${window.location.origin}?next=%2Fcomplete-profile`, scopes: "name email",
    } }));
    expect(mocks.idToken).not.toHaveBeenCalled();
  });

  it("uses the native iOS plugin, never web OAuth, inside the iOS app", async () => {
    native.isIOS.mockReturnValue(true);
    native.signIn.mockResolvedValue({});
    render(<AppleSignInButton />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(native.signIn).toHaveBeenCalledTimes(1));
    expect(mocks.oauth).not.toHaveBeenCalled();
    native.isIOS.mockReturnValue(false);
  });

  it("registers the callback before posting a random raw nonce and reuses it for token sign-in", async () => {
    const post = installHandler();
    post.mockImplementation(() => expect(bridge.__appleResult).toBeTypeOf("function"));
    render(<AppleSignInButton />);
    fireEvent.click(screen.getByRole("button"));
    const message = post.mock.calls[0]?.[0] as { nonce: string } | undefined;
    expect(message?.nonce).toMatch(/^[a-f0-9]{64}$/);
    await respond({ identityToken: "native-token" });
    expect(mocks.idToken).toHaveBeenCalledWith({ provider: "apple", token: "native-token", nonce: message?.nonce });
    expect(mocks.oauth).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it.each([{ error: "native error" }, { cancelled: true }])("returns early on native failure or cancellation: %j", async (result) => {
    installHandler();
    render(<AppleSignInButton />);
    fireEvent.click(screen.getByRole("button"));
    await respond(result);
    expect(mocks.idToken).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(false);
  });

  it("saves returned names only to the authenticated profile and handles a result once", async () => {
    installHandler();
    render(<AppleSignInButton />);
    fireEvent.click(screen.getByRole("button"));
    await respond({ identityToken: "native-token", givenName: "Salil", familyName: "Patankar" });
    await respond({ identityToken: "native-token", givenName: "Salil" });
    expect(mocks.from).toHaveBeenCalledWith("profiles");
    expect(mocks.update).toHaveBeenCalledWith({ first_name: "Salil", last_name: "Patankar" });
    expect(mocks.eq).toHaveBeenCalledWith("id", "apple-user");
    expect(mocks.idToken).toHaveBeenCalledTimes(1);
  });
});