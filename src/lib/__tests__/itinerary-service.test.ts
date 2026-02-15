import { describe, expect, it, vi } from "vitest";

import {
  createAndSendItinerary,
  listItineraries,
  resendItinerary,
  type ServiceDependencies,
} from "@/lib/itinerary-service";
import type {
  CreatePendingParams,
  ItineraryRepository,
} from "@/lib/itinerary-repository";
import type { ItineraryRow } from "@/lib/schema";

class InMemoryItineraryRepository implements ItineraryRepository {
  rows = new Map<string, ItineraryRow>();

  async createPending(params: CreatePendingParams): Promise<void> {
    this.rows.set(params.id, {
      id: params.id,
      kind: params.kind,
      payloadJson: params.payloadJson,
      recipientEmail: params.recipientEmail,
      deliveryStatus: "pending",
      providerMessageId: null,
      lastError: null,
      createdAt: params.createdAt,
      updatedAt: params.createdAt,
      createdByGoogleSub: params.createdByGoogleSub,
      createdByEmail: params.createdByEmail,
    });
  }

  async markSent(id: string, updatedAt: string, providerMessageId: string): Promise<void> {
    const row = this.rows.get(id);
    if (!row) return;
    this.rows.set(id, {
      ...row,
      deliveryStatus: "sent",
      providerMessageId,
      lastError: null,
      updatedAt,
    });
  }

  async markFailed(id: string, updatedAt: string, lastError: string): Promise<void> {
    const row = this.rows.get(id);
    if (!row) return;
    this.rows.set(id, {
      ...row,
      deliveryStatus: "failed",
      lastError,
      updatedAt,
    });
  }

  async listByEmail(email: string): Promise<ItineraryRow[]> {
    return [...this.rows.values()].filter((row) => row.createdByEmail === email);
  }

  async findByIdAndEmail(id: string, email: string): Promise<ItineraryRow | null> {
    const row = this.rows.get(id);
    if (!row || row.createdByEmail !== email) {
      return null;
    }
    return row;
  }
}

function buildDeps(repo: InMemoryItineraryRepository): ServiceDependencies {
  return {
    repository: repo,
    sendEmail: vi.fn().mockResolvedValue({ messageId: "msg_123" }),
    now: () => "2026-02-15T00:00:00.000Z",
    idFactory: () => "itin_123",
  };
}

describe("itinerary service", () => {
  it("creates itinerary, sends email, and stores sent status", async () => {
    const repo = new InMemoryItineraryRepository();
    const deps = buildDeps(repo);

    const result = await createAndSendItinerary(
      {
        kind: "flight",
        reservationNumber: "RXJ34P",
        passengerName: "Eva Green",
        airlineName: "United",
        airlineIataCode: "UA",
        flightNumber: "110",
        departureAirportName: "San Francisco Airport",
        departureAirportIata: "SFO",
        departureTimeIso: "2027-03-04T20:15:00-08:00",
        arrivalAirportName: "John F. Kennedy International Airport",
        arrivalAirportIata: "JFK",
        arrivalTimeIso: "2027-03-05T06:30:00-05:00",
      },
      { email: "user@example.com", googleSub: "google-sub-1" },
      deps
    );

    expect(result.deliveryStatus).toBe("sent");
    expect(deps.sendEmail).toHaveBeenCalledOnce();
    expect(repo.rows.get("itin_123")?.deliveryStatus).toBe("sent");
  });

  it("marks failed when provider send throws", async () => {
    const repo = new InMemoryItineraryRepository();
    const deps = buildDeps(repo);
    deps.sendEmail = vi.fn().mockRejectedValue(new Error("provider down"));

    const result = await createAndSendItinerary(
      {
        kind: "hotel",
        reservationNumber: "abc456",
        guestName: "John Smith",
        lodgingName: "Hilton San Francisco Union Square",
        lodgingPhone: "415-771-1400",
        checkinDateIso: "2027-04-11T16:00:00-08:00",
        checkoutDateIso: "2027-04-13T11:00:00-08:00",
        addressStreet: "333 O'Farrell St",
        addressLocality: "San Francisco",
        addressRegion: "CA",
        addressPostalCode: "94102",
        addressCountry: "US",
      },
      { email: "user@example.com", googleSub: "google-sub-1" },
      deps
    );

    expect(result.deliveryStatus).toBe("failed");
    expect(repo.rows.get("itin_123")?.deliveryStatus).toBe("failed");
    expect(repo.rows.get("itin_123")?.lastError).toBe("provider down");
  });

  it("resends existing itinerary and updates message id", async () => {
    const repo = new InMemoryItineraryRepository();
    const deps = buildDeps(repo);

    await repo.createPending({
      id: "itin_123",
      kind: "flight",
      payloadJson: JSON.stringify({
        kind: "flight",
        reservationNumber: "RXJ34P",
        passengerName: "Eva Green",
        airlineName: "United",
        airlineIataCode: "UA",
        flightNumber: "110",
        departureAirportName: "San Francisco Airport",
        departureAirportIata: "SFO",
        departureTimeIso: "2027-03-04T20:15:00-08:00",
        arrivalAirportName: "John F. Kennedy International Airport",
        arrivalAirportIata: "JFK",
        arrivalTimeIso: "2027-03-05T06:30:00-05:00",
      }),
      recipientEmail: "user@example.com",
      createdByGoogleSub: "google-sub-1",
      createdByEmail: "user@example.com",
      createdAt: "2026-02-15T00:00:00.000Z",
    });

    const result = await resendItinerary("itin_123", { email: "user@example.com" }, deps);

    expect(result.deliveryStatus).toBe("sent");
    expect(result.messageId).toBe("msg_123");
    expect(repo.rows.get("itin_123")?.providerMessageId).toBe("msg_123");
  });

  it("skips invalid stored payloads when listing itineraries", async () => {
    const repo = new InMemoryItineraryRepository();
    const deps = buildDeps(repo);

    await repo.createPending({
      id: "itin_invalid",
      kind: "flight",
      payloadJson: JSON.stringify({
        kind: "flight",
        reservationNumber: "RXJ34P",
      }),
      recipientEmail: "user@example.com",
      createdByGoogleSub: "google-sub-1",
      createdByEmail: "user@example.com",
      createdAt: "2026-02-15T00:00:00.000Z",
    });

    const items = await listItineraries("user@example.com", deps);
    expect(items).toHaveLength(0);
  });

  it("skips malformed JSON payloads when listing itineraries", async () => {
    const repo = new InMemoryItineraryRepository();
    const deps = buildDeps(repo);

    await repo.createPending({
      id: "itin_malformed_json",
      kind: "hotel",
      payloadJson: "{",
      recipientEmail: "user@example.com",
      createdByGoogleSub: "google-sub-1",
      createdByEmail: "user@example.com",
      createdAt: "2026-02-15T00:00:00.000Z",
    });

    const items = await listItineraries("user@example.com", deps);
    expect(items).toHaveLength(0);
  });
});
