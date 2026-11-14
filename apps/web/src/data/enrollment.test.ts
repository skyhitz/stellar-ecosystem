import { describe, expect, it } from "vitest";
import { siteIdFor, validateEnrollment, type EnrollmentForm } from "./enrollment";

const valid: EnrollmentForm = { name: "Skyhitz", domain: "skyhitz.io", email: "team@skyhitz.io", web: true, api: false };

describe("validateEnrollment", () => {
  it("accepts a complete form", () => {
    expect(validateEnrollment(valid)).toEqual({});
    expect(validateEnrollment({ ...valid, web: false, api: true })).toEqual({});
  });

  it("reports every problem at once", () => {
    expect(validateEnrollment({ name: " ", domain: "", email: "", web: false, api: false })).toEqual({
      name: "Enter a project name.",
      domain: "Enter a domain like skyhitz.io.",
      email: "Enter a valid email.",
      kind: "Choose at least one.",
    });
  });

  it.each(["skyhitz", "https://skyhitz.io", "skyhitz.io/path", "sky hitz.io", "skyhitz..io"])(
    "rejects %s as a domain",
    (domain) => {
      expect(validateEnrollment({ ...valid, domain }).domain).toBeDefined();
    },
  );

  it.each(["skyhitz.io", "api.skyhitz.io", "My-Site.Example", "  skyhitz.io  "])("accepts %s as a domain", (domain) => {
    expect(validateEnrollment({ ...valid, domain }).domain).toBeUndefined();
  });

  it.each(["team", "team@", "team@skyhitz", "a b@skyhitz.io"])("rejects %s as an email", (email) => {
    expect(validateEnrollment({ ...valid, email }).email).toBeDefined();
  });
});

describe("siteIdFor", () => {
  it("makes a lowercase slug", () => {
    expect(siteIdFor("Skyhitz")).toBe("skyhitz");
    expect(siteIdFor("My App")).toBe("my-app");
    expect(siteIdFor("  Orbit   Pay 2 ")).toBe("orbit-pay-2");
  });

  it("does not start or end with a dash", () => {
    expect(siteIdFor("My App!")).toBe("my-app");
    expect(siteIdFor("(beta) wallet")).toBe("beta-wallet");
  });

  it("falls back when nothing usable is left", () => {
    expect(siteIdFor("")).toBe("your-site");
    expect(siteIdFor("音楽")).toBe("your-site");
  });
});
