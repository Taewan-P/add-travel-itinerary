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

  const items = await listItineraries(session.user.email);

  return <HistoryList initialItems={items} />;
}
