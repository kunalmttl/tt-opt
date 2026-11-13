import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "University Timetable Optimizer | Genetic Algorithm",
  description: "Constraint-Aware Genetic Algorithm optimizer with real-time streaming and explainable operators for course optimization techniques.",
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
