import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";

export type CloudflareEnv = {
  DB: D1Database;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  ALLOWED_EMAIL?: string;
};

export function getCloudflareEnv(): CloudflareEnv {
  const { env } = getCloudflareContext();
  return env as CloudflareEnv;
}

export function getDb() {
  const env = getCloudflareEnv();
  if (!env.DB) {
    throw new Error("Missing Cloudflare D1 binding `DB`");
  }
  return drizzle(env.DB);
}
