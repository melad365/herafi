import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import bcrypt from "bcrypt"
import { loginSchema } from "@/lib/validations/auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate input
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) {
          return null
        }

        const { email, password } = parsed.data

        // Find user by email (normalized to lowercase)
        const user = await prisma.user.findUnique({
          where: { email },
        })

        // Return null if no user or no hashed password
        if (!user || !user.hashedPassword) {
          return null
        }

        // Compare password
        const passwordMatch = await bcrypt.compare(password, user.hashedPassword)

        if (!passwordMatch) {
          return null
        }

        // Return user on success
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Include user.id in the token
      if (user) {
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }) {
      // Include token.sub (user id) in session.user.id
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
  },
})
