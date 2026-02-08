"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { providerSchema } from "@/lib/validations/profile";
import { becomeProvider, type ProviderActionState } from "@/actions/provider";
import { z } from "zod";

type ProviderFormData = {
  providerBio: string;
  professionalSummary: string;
  skills: string;
  yearsOfExperience: number;
  certifications: string;
};

const initialState: ProviderActionState = {
  success: false,
};

export default function ProviderSetupForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(becomeProvider, initialState);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProviderFormData>();

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  const onSubmit = async (data: ProviderFormData) => {
    const formData = new FormData();
    formData.append("professionalSummary", data.professionalSummary);
    formData.append("providerBio", data.providerBio);
    formData.append("skills", data.skills);
    formData.append("yearsOfExperience", data.yearsOfExperience.toString());
    if (data.certifications) {
      formData.append("certifications", data.certifications);
    }
    formAction(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      {/* Intro Section */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <p className="text-lg text-gray-700">
          Ready to offer your services? Complete your provider profile to start creating gigs and connecting with clients.
        </p>
      </div>

      {state.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 font-medium">
            Success! You're now a provider. Redirecting to dashboard...
          </p>
        </div>
      )}

      {state.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{state.error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Professional Summary */}
        <div>
          <label htmlFor="professionalSummary" className="block text-sm font-medium text-gray-700 mb-1">
            Professional Summary
          </label>
          <p className="text-xs text-gray-500 mb-2">Brief summary of what you offer</p>
          <textarea
            id="professionalSummary"
            {...register("professionalSummary")}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g., Expert plumber with 10+ years of experience in residential repairs and installations"
          />
          {errors.professionalSummary && (
            <p className="mt-1 text-sm text-red-600">{errors.professionalSummary.message}</p>
          )}
          {state.fieldErrors?.professionalSummary && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.professionalSummary[0]}</p>
          )}
        </div>

        {/* Provider Bio */}
        <div>
          <label htmlFor="providerBio" className="block text-sm font-medium text-gray-700 mb-1">
            Provider Bio
          </label>
          <p className="text-xs text-gray-500 mb-2">Detailed description of your expertise and services</p>
          <textarea
            id="providerBio"
            {...register("providerBio")}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Tell clients about your background, specialties, and what makes you unique..."
          />
          {errors.providerBio && (
            <p className="mt-1 text-sm text-red-600">{errors.providerBio.message}</p>
          )}
          {state.fieldErrors?.providerBio && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.providerBio[0]}</p>
          )}
        </div>

        {/* Skills */}
        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
            Skills
          </label>
          <p className="text-xs text-gray-500 mb-2">Enter skills separated by commas</p>
          <input
            id="skills"
            type="text"
            {...register("skills")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g., Plumbing, Pipe Repair, Water Heater Installation"
          />
          {errors.skills && (
            <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>
          )}
          {state.fieldErrors?.skills && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.skills[0]}</p>
          )}
        </div>

        {/* Years of Experience */}
        <div>
          <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-1">
            Years of Experience
          </label>
          <input
            id="yearsOfExperience"
            type="number"
            min="0"
            max="50"
            {...register("yearsOfExperience", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g., 10"
          />
          {errors.yearsOfExperience && (
            <p className="mt-1 text-sm text-red-600">{errors.yearsOfExperience.message}</p>
          )}
          {state.fieldErrors?.yearsOfExperience && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.yearsOfExperience[0]}</p>
          )}
        </div>

        {/* Certifications (Optional) */}
        <div>
          <label htmlFor="certifications" className="block text-sm font-medium text-gray-700 mb-1">
            Certifications <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">Enter certifications separated by commas</p>
          <input
            id="certifications"
            type="text"
            {...register("certifications")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g., Licensed Plumber, Master Plumber Certification"
          />
          {errors.certifications && (
            <p className="mt-1 text-sm text-red-600">{errors.certifications.message}</p>
          )}
          {state.fieldErrors?.certifications && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.certifications[0]}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || state.success}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Setting up..." : "Become a Provider"}
          </button>
        </div>
      </form>
    </div>
  );
}
