import { NextResponse } from "next/server";

import { HttpError, requireAuthorizedUser } from "@/lib/auth-guards";
import { createAndSendItinerary, listItineraries } from "@/lib/itinerary-service";
import { createItinerarySchema } from "@/lib/validation";

function toErrorResponse(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  const message = error instanceof Error ? error.message : "Unexpected error";
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET() {
  try {
    const user = await requireAuthorizedUser();
    const itineraries = await listItineraries(user.email);
    return NextResponse.json({ itineraries });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthorizedUser();

    const body = (await request.json()) as unknown;
    const parsed = createItinerarySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await createAndSendItinerary(parsed.data, user);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
