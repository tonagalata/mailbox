import type { NextAuthConfig } from "next-auth";

// Edge-safe subset of the auth config — no Prisma, no bcrypt.
// Used by middleware to verify JWT sessions without pulling Node-only packages
// into the Edge runtime.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
