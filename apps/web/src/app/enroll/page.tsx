import type { Metadata } from "next";
import { EnrollmentScreen } from "@/features/enroll/EnrollmentScreen";

export const metadata: Metadata = { title: "Enroll a project" };

export default function Page() {
  return <EnrollmentScreen />;
}
