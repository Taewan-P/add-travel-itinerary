import { describe, expect, it } from "vitest";

import { buildJsonLd } from "@/lib/jsonld";

describe("buildJsonLd", () => {
  it("builds required flight reservation JSON-LD", () => {
    const jsonLd = buildJsonLd({
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
    });

    expect(jsonLd["@type"]).toBe("FlightReservation");
    expect(jsonLd.reservationStatus).toBe("http://schema.org/Confirmed");
  });

  it("builds required hotel reservation JSON-LD", () => {
    const jsonLd = buildJsonLd({
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
    });

    expect(jsonLd["@type"]).toBe("LodgingReservation");
    expect(jsonLd.reservationStatus).toBe("http://schema.org/Confirmed");
  });
});
