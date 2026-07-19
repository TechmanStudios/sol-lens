import type { Metadata } from "next";
import "./globals.css";
import "./phase2.css";

const siteUrl = new URL("https://sol-lens.onrender.com/");
const title = "SOL Lens — Semantic Migration Workbench";
const description =
  "Compare observable agent traces, explore their Logon graphs, and replay evidence, coherence, contradiction, and promotion readiness with the SOL Engine.";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title,
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "SOL Lens",
    title,
    description,
    images: [
      {
        url: "/og.png",
        width: 1728,
        height: 909,
        alt: "SOL Lens semantic evidence graph converging on a promotion decision",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
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
