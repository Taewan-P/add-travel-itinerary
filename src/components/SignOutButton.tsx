"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button className="secondary" onClick={() => signOut({ callbackUrl: "/auth/signin" })}>
      Sign out
    </button>
  );
}
