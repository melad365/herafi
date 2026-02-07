export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="w-full max-w-md px-6">
        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-600">Herafi</h1>
          <p className="text-sm text-gray-600 mt-2">
            Find trusted service providers
          </p>
        </div>

        {/* Auth content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
