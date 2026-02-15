import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { getAllowedEmail } from "@/lib/config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  providers: [Google],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider !== "google") {
        return false;
      }

      const email = (profile?.email ?? user.email ?? "").toLowerCase();
      const allowedEmail = getAllowedEmail();
      const emailVerified =
        (profile as { email_verified?: boolean } | undefined)?.email_verified ?? false;

      return Boolean(allowedEmail && email === allowedEmail && emailVerified);
    },
    async jwt({ token, profile }) {
      if (profile) {
        const googleProfile = profile as { sub?: string };
        if (googleProfile.sub) {
          token.googleSub = googleProfile.sub;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.googleSub ?? token.sub ?? "") as string;
        session.user.email = (session.user.email ?? "").toLowerCase();
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});
