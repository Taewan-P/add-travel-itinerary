"use client";

import { useState } from "react";

import type { CreateItineraryResponse } from "@/lib/validation";

const initialState = {
  reservationNumber: "",
  guestName: "",
  lodgingName: "",
  lodgingPhone: "",
  checkinDateIso: "",
  checkoutDateIso: "",
  addressStreet: "",
  addressLocality: "",
  addressRegion: "",
  addressPostalCode: "",
  addressCountry: "",
};

export function HotelForm() {
  const [form, setForm] = useState(initialState);
  const [result, setResult] = useState<CreateItineraryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/itineraries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind: "hotel",
          ...form,
        }),
      });

      const payload = (await response.json()) as CreateItineraryResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Request failed");
      }

      setResult(payload);
      if (payload.deliveryStatus === "sent") {
        setForm(initialState);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="card">
      <h2>Create Hotel Itinerary</h2>
      <form onSubmit={onSubmit}>
        <label>
          Reservation Number
          <input
            required
            value={form.reservationNumber}
            onChange={(event) => update("reservationNumber", event.target.value)}
          />
        </label>
        <label>
          Guest Name
          <input
            required
            value={form.guestName}
            onChange={(event) => update("guestName", event.target.value)}
          />
        </label>
        <label>
          Lodging Name
          <input
            required
            value={form.lodgingName}
            onChange={(event) => update("lodgingName", event.target.value)}
          />
        </label>
        <label>
          Lodging Phone
          <input
            required
            value={form.lodgingPhone}
            onChange={(event) => update("lodgingPhone", event.target.value)}
          />
        </label>
        <label>
          Check-in (ISO 8601 with timezone)
          <input
            required
            placeholder="2027-04-11T16:00:00-08:00"
            value={form.checkinDateIso}
            onChange={(event) => update("checkinDateIso", event.target.value)}
          />
        </label>
        <label>
          Check-out (ISO 8601 with timezone)
          <input
            required
            placeholder="2027-04-13T11:00:00-08:00"
            value={form.checkoutDateIso}
            onChange={(event) => update("checkoutDateIso", event.target.value)}
          />
        </label>
        <label>
          Street Address
          <input
            required
            value={form.addressStreet}
            onChange={(event) => update("addressStreet", event.target.value)}
          />
        </label>
        <label>
          City
          <input
            required
            value={form.addressLocality}
            onChange={(event) => update("addressLocality", event.target.value)}
          />
        </label>
        <label>
          Region/State
          <input
            required
            value={form.addressRegion}
            onChange={(event) => update("addressRegion", event.target.value)}
          />
        </label>
        <label>
          Postal Code
          <input
            required
            value={form.addressPostalCode}
            onChange={(event) => update("addressPostalCode", event.target.value)}
          />
        </label>
        <label>
          Country
          <input
            required
            value={form.addressCountry}
            onChange={(event) => update("addressCountry", event.target.value)}
          />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? "Sending..." : "Send confirmation email"}
        </button>
      </form>

      {error ? <p className="error">{error}</p> : null}
      {result ? (
        <p className={result.deliveryStatus === "sent" ? "success" : "error"}>
          {result.deliveryStatus === "sent"
            ? `Sent. Message ID: ${result.messageId}`
            : `Failed to send: ${result.error}`}
        </p>
      ) : null}
    </div>
  );
}
