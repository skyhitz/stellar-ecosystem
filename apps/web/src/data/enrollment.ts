export interface EnrollmentForm {
  name: string;
  domain: string;
  email: string;
  /** Measure the website with the frontend script. */
  web: boolean;
  /** Measure the API with OpenTelemetry dual export. */
  api: boolean;
}

export type EnrollmentField = "name" | "domain" | "email" | "kind";
export type EnrollmentErrors = Partial<Record<EnrollmentField, string>>;

const DOMAIN_PATTERN = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

/** Returns one message per invalid field; an empty object means the form is valid. */
export function validateEnrollment(form: EnrollmentForm): EnrollmentErrors {
  const errors: EnrollmentErrors = {};
  if (!form.name.trim()) errors.name = "Enter a project name.";
  if (!DOMAIN_PATTERN.test(form.domain.trim())) errors.domain = "Enter a domain like skyhitz.io.";
  if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = "Enter a valid email.";
  if (!form.web && !form.api) errors.kind = "Choose at least one.";
  return errors;
}

/** The `data-site` identifier derived from a project name: "My App" → "my-app". */
export function siteIdFor(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "your-site";
}
