"use client"

import { loginUser } from "@/actions/auth"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"

export default function LoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setServerError(null)
    const result = await loginUser(data)

    if ("error" in result) {
      if (typeof result.error === "string") {
        setServerError(result.error)
      } else {
        setServerError("Please fix the errors above")
      }
    } else {
      // Success - redirect to dashboard
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Welcome back
      </h2>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Your password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors disabled:bg-orange-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* Link to register */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-orange-600 hover:text-orange-700"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
