import type { Route } from "next";

export type Role = "public" | "tenant" | "operator";

export interface NavItem {
  href: Route;
  label: string;
}

/** Tabs shown in the header for each role. */
export const TABS: Record<Role, readonly NavItem[]> = {
  public: [
    { href: "/", label: "Home" },
    { href: "/enroll", label: "Enroll" },
  ],
  tenant: [
    { href: "/tenant/web", label: "Web" },
    { href: "/tenant/api", label: "API" },
    { href: "/tenant/setup", label: "Setup" },
    { href: "/tenant/privacy", label: "Privacy" },
  ],
  operator: [
    { href: "/operator", label: "Global" },
    { href: "/operator/compare", label: "Compare" },
    { href: "/operator/admin", label: "Admin" },
  ],
};

/** The role switch: each role and the screen it opens on. */
export const ROLES: ReadonlyArray<NavItem & { role: Role }> = [
  { role: "public", label: "Public", href: "/" },
  { role: "tenant", label: "Tenant", href: "/tenant/web" },
  { role: "operator", label: "Operator", href: "/operator" },
];

function isWithin(pathname: string, section: string): boolean {
  return pathname === section || pathname.startsWith(`${section}/`);
}

/** Which role's area a path belongs to. Anything outside /tenant and /operator is public. */
export function roleForPath(pathname: string): Role {
  if (isWithin(pathname, "/tenant")) return "tenant";
  if (isWithin(pathname, "/operator")) return "operator";
  return "public";
}
