import type {
  CreateItineraryInput,
  FlightItineraryInput,
  HotelItineraryInput,
} from "@/lib/validation";

type FlightReservationJsonLd = {
  "@context": "http://schema.org";
  "@type": "FlightReservation";
  reservationNumber: string;
  reservationStatus: "http://schema.org/Confirmed";
  underName: {
    "@type": "Person";
    name: string;
  };
  reservationFor: {
    "@type": "Flight";
    flightNumber: string;
    airline: {
      "@type": "Airline";
      name: string;
      iataCode: string;
    };
    departureAirport: {
      "@type": "Airport";
      name: string;
      iataCode: string;
    };
    departureTime: string;
    arrivalAirport: {
      "@type": "Airport";
      name: string;
      iataCode: string;
    };
    arrivalTime: string;
  };
};

type LodgingReservationJsonLd = {
  "@context": "http://schema.org";
  "@type": "LodgingReservation";
  reservationNumber: string;
  reservationStatus: "http://schema.org/Confirmed";
  underName: {
    "@type": "Person";
    name: string;
  };
  reservationFor: {
    "@type": "LodgingBusiness";
    name: string;
    address: {
      "@type": "PostalAddress";
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
    telephone: string;
  };
  checkinDate: string;
  checkoutDate: string;
};

export type ReservationJsonLd = FlightReservationJsonLd | LodgingReservationJsonLd;

function buildFlightJsonLd(input: FlightItineraryInput): FlightReservationJsonLd {
  return {
    "@context": "http://schema.org",
    "@type": "FlightReservation",
    reservationNumber: input.reservationNumber,
    reservationStatus: "http://schema.org/Confirmed",
    underName: {
      "@type": "Person",
      name: input.passengerName,
    },
    reservationFor: {
      "@type": "Flight",
      flightNumber: input.flightNumber,
      airline: {
        "@type": "Airline",
        name: input.airlineName,
        iataCode: input.airlineIataCode,
      },
      departureAirport: {
        "@type": "Airport",
        name: input.departureAirportName,
        iataCode: input.departureAirportIata,
      },
      departureTime: input.departureTimeIso,
      arrivalAirport: {
        "@type": "Airport",
        name: input.arrivalAirportName,
        iataCode: input.arrivalAirportIata,
      },
      arrivalTime: input.arrivalTimeIso,
    },
  };
}

function buildHotelJsonLd(input: HotelItineraryInput): LodgingReservationJsonLd {
  return {
    "@context": "http://schema.org",
    "@type": "LodgingReservation",
    reservationNumber: input.reservationNumber,
    reservationStatus: "http://schema.org/Confirmed",
    underName: {
      "@type": "Person",
      name: input.guestName,
    },
    reservationFor: {
      "@type": "LodgingBusiness",
      name: input.lodgingName,
      address: {
        "@type": "PostalAddress",
        streetAddress: input.addressStreet,
        addressLocality: input.addressLocality,
        addressRegion: input.addressRegion,
        postalCode: input.addressPostalCode,
        addressCountry: input.addressCountry,
      },
      telephone: input.lodgingPhone,
    },
    checkinDate: input.checkinDateIso,
    checkoutDate: input.checkoutDateIso,
  };
}

export function buildJsonLd(input: CreateItineraryInput): ReservationJsonLd {
  if (input.kind === "flight") {
    return buildFlightJsonLd(input);
  }
  return buildHotelJsonLd(input);
}
