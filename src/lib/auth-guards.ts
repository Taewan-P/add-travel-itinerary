import { auth } from "@/auth";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type AuthorizedUser = {
  email: string;
  googleSub: string;
};

export async function requireAuthorizedUser(): Promise<AuthorizedUser> {
  const session = await auth();

  if (!session?.user?.email) {
    throw new HttpError(401, "Not authenticated");
  }

  const allowedEmail = process.env.ALLOWED_EMAIL?.toLowerCase();
  const email = session.user.email.toLowerCase();

  if (!allowedEmail || email !== allowedEmail) {
    throw new HttpError(403, "Email is not allowlisted");
  }

  if (!session.user.id) {
    throw new HttpError(403, "Missing Google subject identifier");
  }

  return {
    email,
    googleSub: session.user.id,
  };
}
