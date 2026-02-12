import Link from "next/link";
import Image from "next/image";
import {
  WrenchScrewdriverIcon,
  PaintBrushIcon,
  SparklesIcon,
  HomeModernIcon,
  BoltIcon,
  TruckIcon,
  ComputerDesktopIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";
import HeroSearch from "@/components/landing/HeroSearch";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-cream-50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Left: Copy + Search */}
            <div>
              <p className="text-burgundy-700 text-sm font-medium tracking-wide uppercase mb-3">
                Trusted service marketplace
              </p>
              <h1 className="text-3xl sm:text-4xl text-burgundy-950 mb-4 leading-snug">
                Find the right person
                <br />
                for the job
              </h1>
              <p className="text-gray-600 text-base mb-8 max-w-md leading-relaxed">
                Browse portfolios, read verified reviews, and connect with
                skilled professionals for plumbing, painting, carpentry,
                and more.
              </p>

              <HeroSearch />

              <div className="mt-6 flex items-center gap-5 text-xs text-gray-500">
                <span>Popular:</span>
                <Link href="/browse/plumbing" className="hover:text-burgundy-700 transition-colors underline underline-offset-2">Plumbing</Link>
                <Link href="/browse/painting" className="hover:text-burgundy-700 transition-colors underline underline-offset-2">Painting</Link>
                <Link href="/browse/cleaning" className="hover:text-burgundy-700 transition-colors underline underline-offset-2">Cleaning</Link>
              </div>
            </div>

            {/* Right: Hero image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-card">
              <Image
                src="/images/hero-craftsman.jpg"
                alt="Craftsman working in a woodworking workshop"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-14 sm:py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl text-gray-900 mb-1">
              Browse by category
            </h2>
            <p className="text-sm text-gray-500">
              Find the right professional for your needs
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <CategoryCard href="/browse/plumbing" icon={<WrenchScrewdriverIcon className="w-5 h-5" />} label="Plumbing" />
            <CategoryCard href="/browse/painting" icon={<PaintBrushIcon className="w-5 h-5" />} label="Painting" />
            <CategoryCard href="/browse/cleaning" icon={<SparklesIcon className="w-5 h-5" />} label="Cleaning" />
            <CategoryCard href="/browse/carpentry" icon={<HomeModernIcon className="w-5 h-5" />} label="Carpentry" />
            <CategoryCard href="/browse/electrical" icon={<BoltIcon className="w-5 h-5" />} label="Electrical" />
            <CategoryCard href="/browse/welding" icon={<WrenchIcon className="w-5 h-5" />} label="Welding" />
            <CategoryCard href="/browse/moving" icon={<TruckIcon className="w-5 h-5" />} label="Moving" />
            <CategoryCard href="/browse/digital-design" icon={<ComputerDesktopIcon className="w-5 h-5" />} label="Digital" />
          </div>

          <div className="mt-6">
            <Link
              href="/gigs"
              className="text-burgundy-700 hover:text-burgundy-900 text-sm inline-flex items-center gap-1.5 group"
            >
              View all services
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-14 sm:py-16 px-4 bg-cream-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl text-gray-900 mb-10 text-center">
            How it works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto md:max-w-none">
            <Step number="1" title="Browse" description="Search by category or keyword. Compare portfolios, ratings, and pricing tiers." />
            <Step number="2" title="Order" description="Pick a tier that fits your budget. Message the provider with any questions first." />
            <Step number="3" title="Done" description="Track progress from start to finish. Leave a review when you're satisfied." />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 sm:py-14 px-4 bg-burgundy-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl text-white mb-2">
            Ready to get started?
          </h2>
          <p className="text-burgundy-200 text-sm mb-6">
            Join Herafi today — browse services or start offering your own.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/gigs"
              className="bg-white text-burgundy-900 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-cream-50 transition-colors"
            >
              Browse services
            </Link>
            <Link
              href="/register"
              className="border border-burgundy-400 text-burgundy-100 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-burgundy-800 transition-colors"
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function CategoryCard({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 bg-cream-50 rounded-lg px-4 py-3.5 border border-transparent hover:border-burgundy-200 hover:bg-burgundy-50 transition-all duration-200 group"
    >
      <span className="text-burgundy-700 group-hover:text-burgundy-800 transition-colors">
        {icon}
      </span>
      <span className="text-sm text-gray-800 group-hover:text-burgundy-900 transition-colors">
        {label}
      </span>
    </Link>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-8 h-8 rounded-full bg-burgundy-100 text-burgundy-800 flex items-center justify-center text-sm mx-auto mb-3">
        {number}
      </div>
      <h3 className="text-base text-gray-900 mb-1.5">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
