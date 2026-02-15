import { auth } from "@/auth";
import { HistoryList } from "@/components/HistoryList";
import { listItineraries } from "@/lib/itinerary-service";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.email) {
    return (
      <div className="card">
        <h2>Sign in required</h2>
      </div>
    );
  }

  let items;
  try {
    items = await listItineraries(session.user.email.toLowerCase());
  } catch (error) {
    console.error("Failed to load itinerary history", error);
    return (
      <div className="card">
        <h2>Failed to load history</h2>
        <p>Please try again later.</p>
      </div>
    );
  }

  return <HistoryList initialItems={items} />;
}
