import type { Metadata } from "next";
import { PrivacyScreen } from "@/features/tenant/PrivacyScreen";

export const metadata: Metadata = { title: "Privacy & erasure" };

export default function Page() {
  return <PrivacyScreen />;
}
