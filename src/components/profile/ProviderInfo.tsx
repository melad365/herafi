import { User } from "@prisma/client"

interface ProviderInfoProps {
  user: Pick<
    User,
    | "isProvider"
    | "providerBio"
    | "professionalSummary"
    | "skills"
    | "yearsOfExperience"
    | "certifications"
  >
}

export default function ProviderInfo({ user }: ProviderInfoProps) {
  // Only render if user is a provider
  if (!user.isProvider) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-burgundy-900 mb-4">
        Provider Details
      </h2>

      {/* Professional Summary */}
      {user.professionalSummary && (
        <div className="mb-6 p-4 bg-burgundy-50 border-l-4 border-burgundy-500 rounded">
          <h3 className="font-semibold text-gray-900 mb-2">
            Professional Summary
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {user.professionalSummary}
          </p>
        </div>
      )}

      {/* Skills */}
      {user.skills.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-burgundy-100 text-burgundy-800 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Years of Experience */}
      {user.yearsOfExperience !== null && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
          <p className="text-gray-700">
            {user.yearsOfExperience}{" "}
            {user.yearsOfExperience === 1 ? "year" : "years"} of professional
            experience
          </p>
        </div>
      )}

      {/* Certifications */}
      {user.certifications.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Certifications</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {user.certifications.map((cert, index) => (
              <li key={index}>{cert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Provider Bio */}
      {user.providerBio && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Provider Bio</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {user.providerBio}
          </p>
        </div>
      )}
    </div>
  )
}
