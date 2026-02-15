"use client";

import { useState } from "react";

import type { ItineraryListItem } from "@/lib/itinerary-service";
import type { CreateItineraryResponse } from "@/lib/validation";

type Props = {
  initialItems: ItineraryListItem[];
};

export function HistoryList({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function resend(id: string) {
    setLoadingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/itineraries/${id}/resend`, {
        method: "POST",
      });

      const payload = (await response.json()) as CreateItineraryResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Resend failed");
      }

      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                deliveryStatus: payload.deliveryStatus,
                providerMessageId: payload.messageId ?? item.providerMessageId,
                lastError: payload.error ?? null,
                updatedAt: new Date().toISOString(),
              }
            : item
        )
      );
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : "Resend failed");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="card">
      <h2>History</h2>
      {error ? <p className="error">{error}</p> : null}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Kind</th>
            <th>Status</th>
            <th>Created</th>
            <th>Updated</th>
            <th>Last Error</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="code">{item.id}</td>
              <td>{item.kind}</td>
              <td className={item.deliveryStatus === "sent" ? "status-sent" : "status-failed"}>
                {item.deliveryStatus}
              </td>
              <td>{item.createdAt}</td>
              <td>{item.updatedAt}</td>
              <td>{item.lastError ?? "-"}</td>
              <td>
                <button
                  className="secondary"
                  onClick={() => resend(item.id)}
                  disabled={loadingId === item.id}
                >
                  {loadingId === item.id ? "Sending..." : "Resend"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
