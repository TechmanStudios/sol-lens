import type { Metadata } from "next";
import "./globals.css";
import "./phase2.css";

export const metadata: Metadata = {
  title: "SOL Lens — Semantic Migration Workbench",
  description:
    "Compare agent traces, compile them into Logons, and evaluate evidence, coherence, contradiction, and promotion readiness with the SOL Engine.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
