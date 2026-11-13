import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChronoGrid | Smart Timetable Optimizer",
  description: "Next-generation smart university timetable optimizer powered by constraint-aware genetic algorithms.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased selection:bg-neutral-800 selection:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
