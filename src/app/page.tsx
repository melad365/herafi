import Link from "next/link";
import {
  WrenchScrewdriverIcon,
  PaintBrushIcon,
  SparklesIcon,
  HomeModernIcon,
  BoltIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  ClockIcon,
  TruckIcon,
  PencilSquareIcon,
  ComputerDesktopIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-burgundy-900 via-burgundy-800 to-burgundy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Find Skilled Craftsmen You Can Trust
            </h1>
            <p className="text-xl sm:text-2xl text-burgundy-100 mb-8 leading-relaxed">
              Connect with verified professionals for in-person and digital services. Quality work, transparent pricing, trusted results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/gigs"
                className="bg-white text-burgundy-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-cream-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Browse Services
              </Link>
              <Link
                href="/provider/setup"
                className="bg-burgundy-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-burgundy-600 transition-all duration-200 border-2 border-burgundy-600"
              >
                Become a Provider
              </Link>
            </div>

            {/* Trust Signals */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center justify-center gap-3">
                <CheckBadgeIcon className="w-8 h-8 text-burgundy-200" />
                <span className="text-burgundy-100">Verified Providers</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <ShieldCheckIcon className="w-8 h-8 text-burgundy-200" />
                <span className="text-burgundy-100">Secure Payments</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <ClockIcon className="w-8 h-8 text-burgundy-200" />
                <span className="text-burgundy-100">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Popular Services
            </h2>
            <p className="text-xl text-gray-600">
              Find the right professional for your needs
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Category Cards */}
            <CategoryCard
              href="/browse/plumbing"
              icon={<WrenchScrewdriverIcon className="w-8 h-8" />}
              label="Plumbing"
            />
            <CategoryCard
              href="/browse/painting"
              icon={<PaintBrushIcon className="w-8 h-8" />}
              label="Painting"
            />
            <CategoryCard
              href="/browse/cleaning"
              icon={<SparklesIcon className="w-8 h-8" />}
              label="Cleaning"
            />
            <CategoryCard
              href="/browse/carpentry"
              icon={<HomeModernIcon className="w-8 h-8" />}
              label="Carpentry"
            />
            <CategoryCard
              href="/browse/electrical"
              icon={<BoltIcon className="w-8 h-8" />}
              label="Electrical"
            />
            <CategoryCard
              href="/browse/welding"
              icon={<WrenchIcon className="w-8 h-8" />}
              label="Welding"
            />
            <CategoryCard
              href="/browse/moving"
              icon={<TruckIcon className="w-8 h-8" />}
              label="Moving"
            />
            <CategoryCard
              href="/browse/digital-design"
              icon={<ComputerDesktopIcon className="w-8 h-8" />}
              label="Digital Design"
            />
          </div>

          <div className="text-center mt-8">
            <Link
              href="/gigs"
              className="text-burgundy-800 hover:text-burgundy-900 font-semibold text-lg inline-flex items-center gap-2 group"
            >
              View All Services
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-cream-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-burgundy-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-burgundy-900">1</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Browse Services
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Explore our marketplace of verified professionals. Filter by category, price, and ratings to find the perfect match.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-burgundy-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-burgundy-900">2</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Place Your Order
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Choose your service tier, review the details, and securely place your order. Connect with the provider instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-burgundy-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-burgundy-900">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Get It Done
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Track your order progress, communicate with your provider, and review the completed work. Quality guaranteed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-burgundy-900 to-burgundy-800 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-burgundy-100 mb-8">
            Join thousands of satisfied customers who trust Herafi for quality services
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/gigs"
              className="bg-white text-burgundy-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-cream-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Find a Service
            </Link>
            <Link
              href="/provider/setup"
              className="bg-burgundy-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-burgundy-600 transition-all duration-200 border-2 border-burgundy-600"
            >
              Start Earning Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Category Card Component
function CategoryCard({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-burgundy-300 hover:shadow-card transition-all duration-200 group"
    >
      <div className="text-burgundy-800 group-hover:text-burgundy-900 transition-colors mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 group-hover:text-burgundy-900 transition-colors">
        {label}
      </h3>
    </Link>
  );
}
