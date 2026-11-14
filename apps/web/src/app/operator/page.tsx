import type { Metadata } from "next";
import { GlobalScreen } from "@/features/operator/GlobalScreen";

export const metadata: Metadata = { title: "Ecosystem overview" };

export default function Page() {
  return <GlobalScreen />;
}
