import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { itineraries, type ItineraryRow } from "@/lib/schema";

export type DeliveryStatus = "pending" | "sent" | "failed";

export type CreatePendingParams = {
  id: string;
  kind: "flight" | "hotel";
  payloadJson: string;
  recipientEmail: string;
  createdByGoogleSub: string;
  createdByEmail: string;
  createdAt: string;
};

export interface ItineraryRepository {
  createPending(params: CreatePendingParams): Promise<void>;
  markSent(id: string, updatedAt: string, providerMessageId: string): Promise<void>;
  markFailed(id: string, updatedAt: string, lastError: string): Promise<void>;
  listByEmail(email: string): Promise<ItineraryRow[]>;
  findByIdAndEmail(id: string, email: string): Promise<ItineraryRow | null>;
}

export class D1ItineraryRepository implements ItineraryRepository {
  async createPending(params: CreatePendingParams): Promise<void> {
    const db = getDb();
    await db.insert(itineraries).values({
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
    const db = getDb();
    await db
      .update(itineraries)
      .set({
        deliveryStatus: "sent",
        providerMessageId,
        lastError: null,
        updatedAt,
      })
      .where(eq(itineraries.id, id));
  }

  async markFailed(id: string, updatedAt: string, lastError: string): Promise<void> {
    const db = getDb();
    await db
      .update(itineraries)
      .set({
        deliveryStatus: "failed",
        lastError,
        updatedAt,
      })
      .where(eq(itineraries.id, id));
  }

  async listByEmail(email: string): Promise<ItineraryRow[]> {
    const db = getDb();
    return db
      .select()
      .from(itineraries)
      .where(eq(itineraries.createdByEmail, email))
      .orderBy(desc(itineraries.createdAt));
  }

  async findByIdAndEmail(id: string, email: string): Promise<ItineraryRow | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(itineraries)
      .where(and(eq(itineraries.id, id), eq(itineraries.createdByEmail, email)))
      .limit(1);

    return rows[0] ?? null;
  }
}
