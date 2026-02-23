import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Page header card */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-burgundy-900 mb-2">
            Help & Support
          </h1>
          <p className="text-gray-600">
            Find answers to common questions and learn how to use Herafi
          </p>
        </div>

        {/* For Buyers section */}
        <section className="bg-white rounded-xl shadow-card p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            For Buyers
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                How to browse and search services
              </h3>
              <p className="text-sm text-gray-600">
                Visit the{" "}
                <Link href="/gigs" className="text-burgundy-700 hover:text-burgundy-800 underline">
                  Browse Services
                </Link>{" "}
                page or explore by{" "}
                <Link href="/categories" className="text-burgundy-700 hover:text-burgundy-800 underline">
                  Categories
                </Link>
                . Use the search bar and filters to find exactly what you need.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                How to place an order
              </h3>
              <p className="text-sm text-gray-600">
                Click on a service to view details, select a pricing tier that fits your needs,
                and click the order button. You'll be guided through the checkout process.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                How messaging works
              </h3>
              <p className="text-sm text-gray-600">
                After placing an order, you can message the provider directly through your{" "}
                <Link href="/dashboard" className="text-burgundy-700 hover:text-burgundy-800 underline">
                  Dashboard
                </Link>
                {" "}or{" "}
                <Link href="/messages" className="text-burgundy-700 hover:text-burgundy-800 underline">
                  Messages
                </Link>{" "}
                page. Real-time chat helps you communicate requirements and updates.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                How to leave reviews
              </h3>
              <p className="text-sm text-gray-600">
                Once your order is completed, you can leave a review from your{" "}
                <Link href="/orders" className="text-burgundy-700 hover:text-burgundy-800 underline">
                  Orders
                </Link>{" "}
                page. Your feedback helps other buyers and improves the marketplace.
              </p>
            </div>
          </div>
        </section>

        {/* For Providers section */}
        <section className="bg-white rounded-xl shadow-card p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            For Providers
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                How to become a provider
              </h3>
              <p className="text-sm text-gray-600">
                Visit the{" "}
                <Link href="/provider/setup" className="text-burgundy-700 hover:text-burgundy-800 underline">
                  Become a Provider
                </Link>{" "}
                page to set up your provider profile. You'll add your professional summary,
                skills, and experience to get started.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                How to create gigs
              </h3>
              <p className="text-sm text-gray-600">
                After becoming a provider, create your service listings (gigs) from your{" "}
                <Link href="/dashboard" className="text-burgundy-700 hover:text-burgundy-800 underline">
                  Dashboard
                </Link>
                . Include clear descriptions, pricing tiers, and quality images to attract buyers.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                How to manage orders
              </h3>
              <p className="text-sm text-gray-600">
                View and manage all incoming orders from your{" "}
                <Link href="/dashboard" className="text-burgundy-700 hover:text-burgundy-800 underline">
                  Dashboard
                </Link>
                . Accept orders, communicate with buyers, and update order status as you work.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Best practices for service descriptions
              </h3>
              <p className="text-sm text-gray-600">
                Write clear, detailed descriptions of what you offer. Use high-quality images,
                set realistic delivery times, and price your tiers competitively. Good descriptions
                lead to more orders and better reviews.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Support section */}
        <section className="bg-white rounded-xl shadow-card p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Contact Support
          </h2>
          <div className="space-y-3 text-gray-700">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Email</h3>
              <p className="text-sm text-gray-600">
                <a
                  href="mailto:support@herafi.test"
                  className="text-burgundy-700 hover:text-burgundy-800 underline"
                >
                  support@herafi.test
                </a>
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-1">Response Time</h3>
              <p className="text-sm text-gray-600">
                We typically respond within 24-48 hours during business days.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
