import { nanoid } from "nanoid";

import { renderConfirmationEmail } from "@/lib/email-template";
import { buildJsonLd } from "@/lib/jsonld";
import {
  D1ItineraryRepository,
  type ItineraryRepository,
} from "@/lib/itinerary-repository";
import { sendEmailViaResend } from "@/lib/resend";
import { createItinerarySchema, type CreateItineraryInput } from "@/lib/validation";

export type CreateItineraryResponse = {
  itineraryId: string;
  deliveryStatus: "sent" | "failed";
  messageId?: string;
  error?: string;
};

export type ItineraryListItem = {
  id: string;
  kind: "flight" | "hotel";
  payload: CreateItineraryInput;
  recipientEmail: string;
  deliveryStatus: "pending" | "sent" | "failed";
  providerMessageId: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ServiceDependencies = {
  repository: ItineraryRepository;
  sendEmail: typeof sendEmailViaResend;
  now: () => string;
  idFactory: () => string;
};

export const defaultServiceDependencies: ServiceDependencies = {
  repository: new D1ItineraryRepository(),
  sendEmail: sendEmailViaResend,
  now: () => new Date().toISOString(),
  idFactory: () => nanoid(),
};

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

export async function createAndSendItinerary(
  input: CreateItineraryInput,
  user: { email: string; googleSub: string },
  deps: ServiceDependencies = defaultServiceDependencies
): Promise<CreateItineraryResponse> {
  const validated = createItinerarySchema.parse(input);
  const id = deps.idFactory();
  const now = deps.now();

  await deps.repository.createPending({
    id,
    kind: validated.kind,
    payloadJson: JSON.stringify(validated),
    recipientEmail: user.email,
    createdByGoogleSub: user.googleSub,
    createdByEmail: user.email,
    createdAt: now,
  });

  try {
    const jsonLd = buildJsonLd(validated);
    const email = renderConfirmationEmail(validated, jsonLd);
    const { messageId } = await deps.sendEmail({
      to: user.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    await deps.repository.markSent(id, deps.now(), messageId);

    return {
      itineraryId: id,
      deliveryStatus: "sent",
      messageId,
    };
  } catch (error) {
    const errorMessage = toErrorMessage(error);
    await deps.repository.markFailed(id, deps.now(), errorMessage);

    return {
      itineraryId: id,
      deliveryStatus: "failed",
      error: errorMessage,
    };
  }
}

export async function listItineraries(
  email: string,
  deps: ServiceDependencies = defaultServiceDependencies
): Promise<ItineraryListItem[]> {
  const rows = await deps.repository.listByEmail(email);
  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    payload: createItinerarySchema.parse(JSON.parse(row.payloadJson)),
    recipientEmail: row.recipientEmail,
    deliveryStatus: row.deliveryStatus,
    providerMessageId: row.providerMessageId,
    lastError: row.lastError,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

export async function resendItinerary(
  itineraryId: string,
  user: { email: string },
  deps: ServiceDependencies = defaultServiceDependencies
): Promise<CreateItineraryResponse> {
  const row = await deps.repository.findByIdAndEmail(itineraryId, user.email);

  if (!row) {
    return {
      itineraryId,
      deliveryStatus: "failed",
      error: "Itinerary not found",
    };
  }

  try {
    const payload = createItinerarySchema.parse(JSON.parse(row.payloadJson));
    const jsonLd = buildJsonLd(payload);
    const email = renderConfirmationEmail(payload, jsonLd);

    const { messageId } = await deps.sendEmail({
      to: row.recipientEmail,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    await deps.repository.markSent(row.id, deps.now(), messageId);

    return {
      itineraryId: row.id,
      deliveryStatus: "sent",
      messageId,
    };
  } catch (error) {
    const errorMessage = toErrorMessage(error);
    await deps.repository.markFailed(row.id, deps.now(), errorMessage);

    return {
      itineraryId: row.id,
      deliveryStatus: "failed",
      error: errorMessage,
    };
  }
}
