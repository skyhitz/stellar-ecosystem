import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import text from "@/components/ui/text.module.css";
import { cx } from "@/lib/format";
import { EcosystemPulse } from "./EcosystemPulse";
import { EnrollLink } from "./EnrollLink";
import styles from "./landing.module.css";

const HOW_IT_WORKS = [
  {
    title: "Web analytics",
    body: "Add one version-pinned script with a Subresource Integrity hash. Page views, visitors, referrers, session duration, bounce rate, countries, devices and browsers.",
  },
  {
    title: "API analytics",
    body: "Dual-export OpenTelemetry to your own APM and to the SCF collector. Traces, spans and logs are dropped on receipt. Only request counts, status codes and latency are kept.",
  },
  {
    title: "Trusted by SCF",
    body: "Your dashboard is private. SCF operators see the same metrics across all projects, so traction reviews no longer depend on self-reported numbers.",
  },
];

const GUARANTEES = [
  { title: "No cookies", body: "GDPR-compliant without opt-in banners" },
  { title: "Pinned script", body: "No remote updates. You choose when to upgrade" },
  { title: "Tenant isolation", body: "You see only your own data" },
  { title: "Zero fees", body: "Free for tenants and for SCF" },
  { title: "Open source", body: "One monorepo, built on Umami" },
];

export function LandingScreen() {
  return (
    <section className={styles.landing}>
      <div className={styles.hero}>
        <div className={styles.pitch}>
          <div className={cx(text.crumb, styles.kicker)}>{"// A shared service for the Stellar Community Fund"}</div>
          <h1 className={styles.headline}>
            <span className={styles.highlight}>Stellar</span> Ecosystem{" "}
            <span className={styles.highlight}>Analytics</span>
          </h1>
          <p className={styles.lede}>
            Privacy-first web analytics and OpenTelemetry API metrics for every project in the ecosystem. One snippet,
            no cookies, no fees. The numbers SCF reviewers see are the numbers you see.
          </p>
          <div className={styles.actions}>
            <EnrollLink />
            <ButtonLink href="/tenant/web" variant="ghost">
              View tenant demo
            </ButtonLink>
          </div>
        </div>
        <EcosystemPulse />
      </div>

      <div className={styles.how}>
        <div className={text.crumb}>{"// HOW IT WORKS"}</div>
        <div className={styles.steps}>
          {HOW_IT_WORKS.map((step, i) => (
            <Card key={step.title} className={styles.step}>
              <div className={styles.stepNumber}>{String(i + 1).padStart(2, "0")}</div>
              <h2 className={styles.stepTitle}>{step.title}</h2>
              <p className={styles.stepBody}>{step.body}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className={styles.guarantees}>
        {GUARANTEES.map((item) => (
          <div key={item.title} className={styles.guarantee}>
            <div className={styles.guaranteeTitle}>{item.title}</div>
            <div className={styles.guaranteeBody}>{item.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
