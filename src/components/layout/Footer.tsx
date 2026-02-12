import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="text-2xl font-bold text-burgundy-900 hover:text-burgundy-800 transition-colors">
              Herafi
            </Link>
            <p className="mt-2 text-sm text-gray-600">
              Find skilled craftsmen you can trust.
            </p>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Marketplace</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/gigs" className="text-sm text-gray-600 hover:text-burgundy-800 transition-colors">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link href="/provider/setup" className="text-sm text-gray-600 hover:text-burgundy-800 transition-colors">
                  Become a Provider
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-burgundy-800 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/messages" className="text-sm text-gray-600 hover:text-burgundy-800 transition-colors">
                  Messages
                </Link>
              </li>
              <li>
                <Link href="/profile/edit" className="text-sm text-gray-600 hover:text-burgundy-800 transition-colors">
                  Profile Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-burgundy-800 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-burgundy-800 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-burgundy-800 transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            © {new Date().getFullYear()} Herafi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
