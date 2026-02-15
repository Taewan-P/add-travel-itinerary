import { describe, expect, it } from "vitest";

import { renderConfirmationEmail } from "@/lib/email-template";
import { buildJsonLd } from "@/lib/jsonld";

describe("renderConfirmationEmail", () => {
  it("includes one JSON-LD script tag and a plain text fallback", () => {
    const input = {
      kind: "flight" as const,
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
    };

    const email = renderConfirmationEmail(input, buildJsonLd(input));

    expect(email.html.match(/<script type="application\/ld\+json">/g)).toHaveLength(1);
    expect(email.text).toContain("Reservation Number: RXJ34P");
  });
});
