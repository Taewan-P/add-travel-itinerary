"use client";

import { useState } from "react";

import type { CreateItineraryResponse } from "@/lib/validation";

const initialState = {
  reservationNumber: "",
  passengerName: "",
  airlineName: "",
  airlineIataCode: "",
  flightNumber: "",
  departureAirportName: "",
  departureAirportIata: "",
  departureTimeIso: "",
  arrivalAirportName: "",
  arrivalAirportIata: "",
  arrivalTimeIso: "",
};

export function FlightForm() {
  const [form, setForm] = useState(initialState);
  const [result, setResult] = useState<CreateItineraryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/itineraries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind: "flight",
          ...form,
          airlineIataCode: form.airlineIataCode.toUpperCase(),
          departureAirportIata: form.departureAirportIata.toUpperCase(),
          arrivalAirportIata: form.arrivalAirportIata.toUpperCase(),
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
      <h2>Create Flight Itinerary</h2>
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
          Passenger Name
          <input
            required
            value={form.passengerName}
            onChange={(event) => update("passengerName", event.target.value)}
          />
        </label>
        <label>
          Airline Name
          <input
            required
            value={form.airlineName}
            onChange={(event) => update("airlineName", event.target.value)}
          />
        </label>
        <label>
          Airline IATA Code (2 chars)
          <input
            required
            minLength={2}
            maxLength={2}
            value={form.airlineIataCode}
            onChange={(event) => update("airlineIataCode", event.target.value)}
          />
        </label>
        <label>
          Flight Number
          <input
            required
            value={form.flightNumber}
            onChange={(event) => update("flightNumber", event.target.value)}
          />
        </label>
        <label>
          Departure Airport Name
          <input
            required
            value={form.departureAirportName}
            onChange={(event) => update("departureAirportName", event.target.value)}
          />
        </label>
        <label>
          Departure Airport IATA (3 letters)
          <input
            required
            minLength={3}
            maxLength={3}
            value={form.departureAirportIata}
            onChange={(event) => update("departureAirportIata", event.target.value)}
          />
        </label>
        <label>
          Departure Time (ISO 8601 with timezone)
          <input
            required
            placeholder="2027-03-04T20:15:00-08:00"
            value={form.departureTimeIso}
            onChange={(event) => update("departureTimeIso", event.target.value)}
          />
        </label>
        <label>
          Arrival Airport Name
          <input
            required
            value={form.arrivalAirportName}
            onChange={(event) => update("arrivalAirportName", event.target.value)}
          />
        </label>
        <label>
          Arrival Airport IATA (3 letters)
          <input
            required
            minLength={3}
            maxLength={3}
            value={form.arrivalAirportIata}
            onChange={(event) => update("arrivalAirportIata", event.target.value)}
          />
        </label>
        <label>
          Arrival Time (ISO 8601 with timezone)
          <input
            required
            placeholder="2027-03-05T06:30:00-05:00"
            value={form.arrivalTimeIso}
            onChange={(event) => update("arrivalTimeIso", event.target.value)}
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
