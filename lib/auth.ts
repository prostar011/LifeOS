import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || user.password !== credentials.password) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          plan: user.plan,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.plan = (user as any).plan ?? "free";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).plan = token.plan;
      }
      return session;
    },
  },
};

/**
 * Returns the authenticated user, or falls back to the demo user
 * so the preview works without requiring a login.
 */
export async function currentUser() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const u = session.user as any;
    return { id: u.id, email: u.email, name: u.name, plan: u.plan ?? "free" };
  }
  // Demo fallback for preview
  const demo = await db.user.findUnique({ where: { email: "demo@lifeos.app" } });
  if (demo) {
    return { id: demo.id, email: demo.email, name: demo.name, plan: demo.plan };
  }
  return null;
}
