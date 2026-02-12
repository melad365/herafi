"use client"

import { registerUser } from "@/actions/auth"
import { registerSchema, type RegisterInput } from "@/lib/validations/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"

export default function RegisterPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null)
    const result = await registerUser(data)

    if ("error" in result) {
      // Check if error is field-level or general
      if (typeof result.error === "string") {
        setServerError(result.error)
      } else {
        // Field-level errors are already handled by react-hook-form
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
        Create your account
      </h2>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name field */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500 transition-colors duration-200"
            placeholder="Your full name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

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
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500 transition-colors duration-200"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500 transition-colors duration-200"
            placeholder="At least 8 characters"
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
          className="w-full bg-burgundy-800 hover:bg-burgundy-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200 disabled:bg-burgundy-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      {/* Link to login */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-burgundy-700 hover:text-burgundy-800 transition-colors duration-200"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
