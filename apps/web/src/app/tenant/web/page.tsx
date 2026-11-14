import type { Metadata } from "next";
import { WebAnalyticsScreen } from "@/features/tenant/WebAnalyticsScreen";

export const metadata: Metadata = { title: "Web analytics" };

export default function Page() {
  return <WebAnalyticsScreen />;
}
