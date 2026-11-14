import type { Metadata } from "next";
import { CompareScreen } from "@/features/operator/CompareScreen";

export const metadata: Metadata = { title: "Side by side" };

export default function Page() {
  return <CompareScreen />;
}
