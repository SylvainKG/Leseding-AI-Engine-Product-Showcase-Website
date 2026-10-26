import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ShowcaseProvider } from "@/components/ShowcaseProvider";
import { STORAGE_KEY } from "@/config/showcase-config";
import { themeBootScript } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Leseding AI Engine — Interactive Showcase",
  description:
    "An interactive demonstration of Leseding AI Engine: voice-first AI customer support for organisations, with a simulated organisation dashboard.",
};

export const viewport: Viewport = {
  themeColor: "#060A18",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript(STORAGE_KEY) }} />
      </head>
      <body className="min-h-dvh">
        <ShowcaseProvider>{children}</ShowcaseProvider>
      </body>
    </html>
  );
}
