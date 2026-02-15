import type { Metadata } from "next";
import Link from "next/link";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Travel Itinerary Mailer",
  description: "Generate Gmail-compatible itinerary confirmation emails",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>
          <div className="card header-row">
            <strong>Travel Itinerary Mailer</strong>
            <nav>
              <Link href="/">Home</Link> | <Link href="/flight/new">New Flight</Link> |{" "}
              <Link href="/hotel/new">New Hotel</Link> | <Link href="/history">History</Link>
            </nav>
          </div>
          {children}
        </main>
      </body>
    </html>
  );
}
