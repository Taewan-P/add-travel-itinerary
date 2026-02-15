import Link from "next/link";

import { auth } from "@/auth";
import { SignOutButton } from "@/components/SignOutButton";
import { listItineraries } from "@/lib/itinerary-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user?.email) {
    return (
      <div className="card">
        <h2>Sign in required</h2>
        <p>
          Visit <Link href="/auth/signin">/auth/signin</Link> to continue.
        </p>
      </div>
    );
  }

  let recentCount = 0;
  try {
    const recent = await listItineraries(session.user.email);
    recentCount = recent.length;
  } catch {
    recentCount = 0;
  }

  return (
    <>
      <div className="card header-row">
        <div>
          <h2>Dashboard</h2>
          <p className="code">Signed in as {session.user.email}</p>
        </div>
        <SignOutButton />
      </div>
      <div className="grid">
        <div className="card">
          <h3>Create flight reservation email</h3>
          <p>Enter strict flight details and send a Gmail-parseable JSON-LD confirmation.</p>
          <Link href="/flight/new">Open flight form</Link>
        </div>
        <div className="card">
          <h3>Create hotel reservation email</h3>
          <p>Enter strict lodging details and send a Gmail-parseable JSON-LD confirmation.</p>
          <Link href="/hotel/new">Open hotel form</Link>
        </div>
        <div className="card">
          <h3>Send history</h3>
          <p>Stored itineraries: {recentCount}</p>
          <Link href="/history">Open history</Link>
        </div>
      </div>
    </>
  );
}
