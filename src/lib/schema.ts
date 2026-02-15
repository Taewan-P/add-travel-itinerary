import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const itineraries = sqliteTable("itineraries", {
  id: text("id").primaryKey(),
  kind: text("kind", { enum: ["flight", "hotel"] }).notNull(),
  payloadJson: text("payload_json").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  deliveryStatus: text("delivery_status", {
    enum: ["pending", "sent", "failed"],
  }).notNull(),
  providerMessageId: text("provider_message_id"),
  lastError: text("last_error"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  createdByGoogleSub: text("created_by_google_sub").notNull(),
  createdByEmail: text("created_by_email").notNull(),
});

export type ItineraryRow = typeof itineraries.$inferSelect;
