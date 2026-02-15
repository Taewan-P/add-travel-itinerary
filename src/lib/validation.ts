import { z } from "zod";

const isoDateTimeString = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d{1,3})?([+-]\d{2}:\d{2}|Z)$/,
    "Must be an ISO 8601 date-time with timezone"
  )
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date-time");

const nonEmptyString = z.string().trim().min(1);

export const flightItinerarySchema = z.object({
  kind: z.literal("flight"),
  reservationNumber: nonEmptyString,
  passengerName: nonEmptyString,
  airlineName: nonEmptyString,
  airlineIataCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{2}$/, "Airline IATA code must be 2 characters"),
  flightNumber: nonEmptyString,
  departureAirportName: nonEmptyString,
  departureAirportIata: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Departure airport IATA code must be 3 letters"),
  departureTimeIso: isoDateTimeString,
  arrivalAirportName: nonEmptyString,
  arrivalAirportIata: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Arrival airport IATA code must be 3 letters"),
  arrivalTimeIso: isoDateTimeString,
});

export const hotelItinerarySchema = z.object({
  kind: z.literal("hotel"),
  reservationNumber: nonEmptyString,
  guestName: nonEmptyString,
  lodgingName: nonEmptyString,
  lodgingPhone: nonEmptyString,
  checkinDateIso: isoDateTimeString,
  checkoutDateIso: isoDateTimeString,
  addressStreet: nonEmptyString,
  addressLocality: nonEmptyString,
  addressRegion: nonEmptyString,
  addressPostalCode: nonEmptyString,
  addressCountry: nonEmptyString,
});

export const createItinerarySchema = z.discriminatedUnion("kind", [
  flightItinerarySchema,
  hotelItinerarySchema,
]);

export type FlightItineraryInput = z.infer<typeof flightItinerarySchema>;
export type HotelItineraryInput = z.infer<typeof hotelItinerarySchema>;
export type CreateItineraryInput = z.infer<typeof createItinerarySchema>;

export type CreateItineraryResponse = {
  itineraryId: string;
  deliveryStatus: "sent" | "failed";
  messageId?: string;
  error?: string;
};
