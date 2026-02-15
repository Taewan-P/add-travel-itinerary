import { describe, expect, it } from "vitest";

import { createItinerarySchema } from "@/lib/validation";

describe("createItinerarySchema", () => {
  it("rejects malformed IATA codes", () => {
    const result = createItinerarySchema.safeParse({
      kind: "flight",
      reservationNumber: "RXJ34P",
      passengerName: "Eva Green",
      airlineName: "United",
      airlineIataCode: "UAA",
      flightNumber: "110",
      departureAirportName: "San Francisco Airport",
      departureAirportIata: "SFO",
      departureTimeIso: "2027-03-04T20:15:00-08:00",
      arrivalAirportName: "John F. Kennedy International Airport",
      arrivalAirportIata: "JFK",
      arrivalTimeIso: "2027-03-05T06:30:00-05:00",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid ISO datetime values", () => {
    const result = createItinerarySchema.safeParse({
      kind: "hotel",
      reservationNumber: "abc456",
      guestName: "John Smith",
      lodgingName: "Hilton San Francisco Union Square",
      lodgingPhone: "415-771-1400",
      checkinDateIso: "2027/04/11 16:00",
      checkoutDateIso: "2027-04-13T11:00:00-08:00",
      addressStreet: "333 O'Farrell St",
      addressLocality: "San Francisco",
      addressRegion: "CA",
      addressPostalCode: "94102",
      addressCountry: "US",
    });

    expect(result.success).toBe(false);
  });
});
