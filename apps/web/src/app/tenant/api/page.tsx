import type { Metadata } from "next";
import { ApiAnalyticsScreen } from "@/features/tenant/ApiAnalyticsScreen";

export const metadata: Metadata = { title: "API analytics" };

export default function Page() {
  return <ApiAnalyticsScreen />;
}
