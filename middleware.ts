import { NextResponse } from "next/server";

import { auth } from "@/auth";

const PUBLIC_PATHS = new Set(["/auth/signin"]);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/api/auth") ||
    PUBLIC_PATHS.has(pathname)
  ) {
    return NextResponse.next();
  }

  if (!req.auth?.user?.email) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const signInUrl = new URL("/auth/signin", req.nextUrl.origin);
    return NextResponse.redirect(signInUrl);
  }

  const allowedEmail = process.env.ALLOWED_EMAIL?.toLowerCase();
  const currentEmail = req.auth.user.email.toLowerCase();

  if (!allowedEmail || currentEmail !== allowedEmail) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Email is not allowlisted" }, { status: 403 });
    }

    const signInUrl = new URL("/auth/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("error", "AccessDenied");
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
