import type { Metadata } from "next";
import { AdminScreen } from "@/features/operator/AdminScreen";

export const metadata: Metadata = { title: "Administration" };

export default function Page() {
  return <AdminScreen />;
}
