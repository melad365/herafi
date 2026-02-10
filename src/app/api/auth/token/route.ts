import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = await cookies()

  // Check for session token in cookies
  // Development: authjs.session-token
  // Production: __Secure-authjs.session-token
  const isDev = process.env.NODE_ENV !== "production"
  const cookieName = isDev ? "authjs.session-token" : "__Secure-authjs.session-token"

  const token = cookieStore.get(cookieName)?.value

  if (!token) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    )
  }

  return NextResponse.json({ token })
}
