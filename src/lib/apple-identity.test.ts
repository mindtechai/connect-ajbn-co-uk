import { describe, it, expect } from "vitest";
import { isAppleUser, appleFullName, splitName } from "./apple-identity";

describe("apple identity", () => {
  it("detects Apple via provider or providers list", () => {
    expect(isAppleUser({ app_metadata: { provider: "apple" }, user_metadata: {}, email: "" } as never)).toBe(true);
    expect(isAppleUser({ app_metadata: { provider: "email", providers: ["email", "apple"] }, user_metadata: {}, email: "" } as never)).toBe(true);
    expect(isAppleUser({ app_metadata: { provider: "google", providers: ["google"] }, user_metadata: {}, email: "" } as never)).toBe(false);
  });
  it("reads full_name, name or fullName", () => {
    expect(appleFullName({ app_metadata: {}, user_metadata: { full_name: "Jane Doe" } } as never)).toBe("Jane Doe");
    expect(appleFullName({ app_metadata: {}, user_metadata: { name: "Ann Lee" } } as never)).toBe("Ann Lee");
    expect(appleFullName({ app_metadata: {}, user_metadata: { fullName: "Raj Shah" } } as never)).toBe("Raj Shah");
  });
  it("splits names", () => {
    expect(splitName("Mary Ann Smith")).toEqual({ first: "Mary", last: "Ann Smith" });
  });
});
