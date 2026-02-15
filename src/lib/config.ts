import { getCloudflareContext } from "@opennextjs/cloudflare";

function normalizeEmail(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : undefined;
}

export function getAllowedEmail(): string | undefined {
  const fromProcess = normalizeEmail(process.env.ALLOWED_EMAIL);
  if (fromProcess) {
    return fromProcess;
  }

  try {
    const { env } = getCloudflareContext();
    return normalizeEmail((env as { ALLOWED_EMAIL?: string }).ALLOWED_EMAIL);
  } catch {
    return undefined;
  }
}
