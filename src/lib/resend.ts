import { getCloudflareEnv } from "@/lib/db";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type SendEmailResult = {
  messageId: string;
};

function getSetting(name: "RESEND_API_KEY" | "RESEND_FROM_EMAIL"): string {
  const env = getCloudflareEnv();
  const fromEnv = env[name];
  const fromProcess = process.env[name];
  const value = fromEnv ?? fromProcess;

  if (!value) {
    throw new Error(`Missing required setting: ${name}`);
  }

  return value;
}

export async function sendEmailViaResend(params: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = getSetting("RESEND_API_KEY");
  const from = getSetting("RESEND_FROM_EMAIL");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });

  const responseJson = (await response.json()) as {
    id?: string;
    error?: { message?: string };
    message?: string;
  };

  if (!response.ok || !responseJson.id) {
    const errorMessage =
      responseJson.error?.message ?? responseJson.message ?? "Failed to send email via Resend";
    throw new Error(errorMessage);
  }

  return { messageId: responseJson.id };
}
