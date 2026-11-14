import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import layout from "@/components/ui/layout.module.css";
import { PageHeading } from "@/components/ui/PageHeading";
import text from "@/components/ui/text.module.css";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section className={layout.stack}>
      <PageHeading crumb="// 404" title="Page not found" />
      <p className={text.note}>There is nothing at this address.</p>
      <div>
        <ButtonLink href="/" variant="ghost">
          Back to home
        </ButtonLink>
      </div>
    </section>
  );
}
