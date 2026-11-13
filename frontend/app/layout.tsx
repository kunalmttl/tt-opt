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
    <html lang="en">
      <body className="bg-background text-foreground antialiased selection:bg-forest selection:text-white">
        {children}
      </body>
    </html>
  );
}
