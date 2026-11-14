import { describe, expect, it } from "vitest";
import { ROLES, TABS, roleForPath } from "./routes";

describe("roleForPath", () => {
  it("maps each area to its role", () => {
    expect(roleForPath("/")).toBe("public");
    expect(roleForPath("/enroll")).toBe("public");
    expect(roleForPath("/tenant/web")).toBe("tenant");
    expect(roleForPath("/tenant")).toBe("tenant");
    expect(roleForPath("/operator")).toBe("operator");
    expect(roleForPath("/operator/admin")).toBe("operator");
  });

  it("matches whole path segments only", () => {
    expect(roleForPath("/tenants")).toBe("public");
    expect(roleForPath("/operator-guide")).toBe("public");
    expect(roleForPath("/nope")).toBe("public");
  });
});

describe("navigation", () => {
  it("opens every role on one of its own tabs", () => {
    for (const { role, href } of ROLES) {
      expect(TABS[role].map((tab) => tab.href)).toContain(href);
    }
  });
});
