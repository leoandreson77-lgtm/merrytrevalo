import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "./db";
import { User } from "@/models/User";
import { verifyPassword } from "./auth-helpers";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email.toLowerCase() });

        if (!user || user.status !== "active") {
          throw new Error("No active user found with this email");
        }

        const isValid = verifyPassword(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        const dbUser = user as any;
        return {
          id: dbUser._id.toString(),
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          vendorId: dbUser.vendorId?.toString() || null,
          tokenVersion: dbUser.tokenVersion || 0,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.vendorId = (user as any).vendorId;
        token.tokenVersion = (user as any).tokenVersion || 0;
      } else if (token.email) {
        // Validate tokenVersion against database on session check
        try {
          await connectToDatabase();
          const dbUser = await User.findOne({ email: (token.email as string).toLowerCase() });
          if (dbUser && (dbUser.tokenVersion || 0) > ((token.tokenVersion as number) || 0)) {
            // Token invalidated by "Logout All Devices"
            return {} as any;
          }
        } catch (err) {
          console.warn("Session tokenVersion check failed:", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (!token.email) {
        return {} as any;
      }
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).vendorId = token.vendorId;
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "super-secret-development-key-12345",
};
