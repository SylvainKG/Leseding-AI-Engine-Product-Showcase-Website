import type { Metadata } from "next";
import { CustomizePage } from "@/components/CustomizeEditor";

export const metadata: Metadata = {
  title: "Customize Showcase — Leseding AI Engine",
  robots: { index: false },
};

export default function Page() {
  return <CustomizePage />;
}
