"use server"

import { signIn } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { loginSchema, registerSchema } from "@/lib/validations/auth"
import bcrypt from "bcrypt"
import { AuthError } from "next-auth"

type ActionResult =
  | { success: true }
  | { error: string | Record<string, string[]> }

/**
 * Register a new user
 * Creates user with hashed password and auto-signs in
 */
export async function registerUser(data: {
  name: string
  email: string
  password: string
}): Promise<ActionResult> {
  try {
    // Validate input
    const parsed = registerSchema.safeParse(data)
    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors }
    }

    const { name, email, password } = parsed.data

    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: "An account with this email already exists" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
    })

    // Auto sign-in after registration
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

/**
 * Log in an existing user
 * Authenticates via Auth.js credentials provider
 */
export async function loginUser(data: {
  email: string
  password: string
}): Promise<ActionResult> {
  try {
    // Validate input
    const parsed = loginSchema.safeParse(data)
    if (!parsed.success) {
      return { error: "Invalid email or password" }
    }

    const { email, password } = parsed.data

    // Attempt sign-in
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    return { success: true }
  } catch (error) {
    // Auth.js throws AuthError on failed credentials
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" }
    }
    console.error("Login error:", error)
    return { error: "Something went wrong. Please try again." }
  }
}
