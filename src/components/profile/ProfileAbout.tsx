interface ProfileAboutProps {
  bio: string | null
}

export default function ProfileAbout({ bio }: ProfileAboutProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
      {bio ? (
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {bio}
        </p>
      ) : (
        <p className="text-gray-500 italic">No bio yet</p>
      )}
    </div>
  )
}
