import { beforeEach, describe, expect, it, vi } from "vitest";

const { MockHttpError, requireAuthorizedUserMock, createAndSendItineraryMock, listItinerariesMock } =
  vi.hoisted(() => {
    class MockHttpError extends Error {
      status: number;

      constructor(status: number, message: string) {
        super(message);
        this.status = status;
      }
    }

    return {
      MockHttpError,
      requireAuthorizedUserMock: vi.fn(),
      createAndSendItineraryMock: vi.fn(),
      listItinerariesMock: vi.fn(),
    };
  });

vi.mock("@/lib/auth-guards", () => ({
  HttpError: MockHttpError,
  requireAuthorizedUser: requireAuthorizedUserMock,
}));

vi.mock("@/lib/itinerary-service", () => ({
  createAndSendItinerary: createAndSendItineraryMock,
  listItineraries: listItinerariesMock,
}));

describe("/api/itineraries route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    requireAuthorizedUserMock.mockRejectedValue(new MockHttpError(401, "Not authenticated"));

    const { GET } = await import("@/app/api/itineraries/route");
    const response = await GET();

    expect(response.status).toBe(401);
  });

  it("returns 403 when email is not allowlisted", async () => {
    requireAuthorizedUserMock.mockRejectedValue(new MockHttpError(403, "Email is not allowlisted"));

    const { GET } = await import("@/app/api/itineraries/route");
    const response = await GET();

    expect(response.status).toBe(403);
  });

  it("creates itinerary for authenticated user", async () => {
    requireAuthorizedUserMock.mockResolvedValue({
      email: "allowed@example.com",
      googleSub: "google-sub-1",
    });

    createAndSendItineraryMock.mockResolvedValue({
      itineraryId: "itin_1",
      deliveryStatus: "sent",
      messageId: "msg_1",
    });

    const { POST } = await import("@/app/api/itineraries/route");
    const request = new Request("http://localhost/api/itineraries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
    });

    const response = await POST(request);
    const payload = (await response.json()) as { deliveryStatus: string };

    expect(response.status).toBe(200);
    expect(payload.deliveryStatus).toBe("sent");
  });
});
