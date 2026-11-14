import type { Metadata } from "next";
import { SetupScreen } from "@/features/tenant/SetupScreen";

export const metadata: Metadata = { title: "Instrumentation" };

export default function Page() {
  return <SetupScreen />;
}
