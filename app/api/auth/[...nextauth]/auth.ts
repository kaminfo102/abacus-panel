import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Identifier", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password || !credentials?.role) {
          return null;
        }

        const { identifier, password, role } = credentials;

        try {
          // Admin login with email
          if (role === "ADMIN") {
            const user = await db.user.findFirst({
              where: {
                email: identifier,
                role: "ADMIN"
              }
            });

            if (!user || !user.password) return null;

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) return null;

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            };
          } 
          // Student login with nationalId
          else if (role === "STUDENT") {
            const student = await db.student.findUnique({
              where: {
                nationalId: identifier,
              },
              include: {
                user: true
              }
            });

            if (!student || !student.user || !student.user.password || student.mobileNumber !== password) {
              return null;
            }

            return {
              id: student.user.id,
              name: `${student.firstName} ${student.lastName}`,
              email: student.user.email,
              role: student.user.role,
              studentId: student.id
            };
          }

          return null;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.studentId = (user as any).studentId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.studentId = token.studentId as string | undefined;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Handle absolute URLs that are on the same domain
      else if (new URL(url).origin === baseUrl) return url;
      // Default to baseUrl
      return baseUrl;
    },
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
  },
}; 