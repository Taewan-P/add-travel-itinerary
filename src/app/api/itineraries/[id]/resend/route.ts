import { NextResponse } from "next/server";

import { HttpError, requireAuthorizedUser } from "@/lib/auth-guards";
import { resendItinerary } from "@/lib/itinerary-service";

function toErrorResponse(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  const message = error instanceof Error ? error.message : "Unexpected error";
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthorizedUser();
    const { id } = await context.params;

    const result = await resendItinerary(id, user);
    if (result.deliveryStatus === "failed" && result.error === "Itinerary not found") {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
