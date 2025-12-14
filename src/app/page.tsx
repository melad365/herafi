'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SignInModal } from '@/components/auth/SignInModal';
import { SignUpModal } from '@/components/auth/SignUpModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { serviceCategories } from '@/data/categories';
import { MagnifyingGlassIcon, SparklesIcon, StarIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  // Preload hero image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setHeroImageLoaded(true);
    img.onerror = () => setHeroImageLoaded(true); // Show hero even if image fails
    img.src = '/hero.png';
  }, []);

  // Function to get category translation key
  const getCategoryKey = (name: string) => {
    const keyMap: { [key: string]: string } = {
      'Home Cleaning': 'home_cleaning',
      'Plumbing': 'plumbing', 
      'Electrical': 'electrical',
      'Painting': 'painting',
      'Landscaping': 'landscaping',
      'Handyman': 'handyman',
      'Moving': 'moving',
      'Cooking': 'cooking'
    };
    return keyMap[name] || name.toLowerCase().replace(' ', '_');
  };

  const switchToSignUp = () => {
    setShowSignInModal(false);
    setShowSignUpModal(true);
  };

  const switchToSignIn = () => {
    setShowSignUpModal(false);
    setShowSignInModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header 
        user={user} 
        onSignOut={logout}
        onSignInClick={() => setShowSignInModal(true)}
        onSignUpClick={() => setShowSignUpModal(true)}
      />
      
      <main>
        {!heroImageLoaded && (
          <section className="relative py-12 lg:py-16 bg-gray-50 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
            </div>
          </section>
        )}

        {heroImageLoaded && (
          <section className="relative overflow-hidden py-12 lg:py-16" style={{backgroundImage: 'url(/hero.png)', backgroundSize: 'cover', backgroundPosition: 'center', willChange: 'transform', transform: 'translateZ(0)'}}>
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h1 className="text-5xl lg:text-7xl font-bold mb-4 tracking-tight">
              {t('hero.title_1')}
              <span className="block text-[#8F210E]">{t('hero.title_2')}</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>
            
            <div className="max-w-2xl mx-auto mb-6">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('hero.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-32 py-4 text-lg rounded-xl border-0 shadow-lg focus:ring-2 focus:ring-white text-gray-900 bg-white"
                />
                <Button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#8F210E] hover:bg-[#7A1010]"
                  size="sm"
                >
                  {t('hero.search_button')}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="opacity-75">{t('hero.popular')}</span>
              {['House Cleaning', 'Plumbing', 'Painting', 'Moving'].map((tag) => (
                <button
                  key={tag}
                  className="px-4 py-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>
        )}

        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 font-modern">
                {t('services.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t('services.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {serviceCategories.map((category) => (
                <Link key={category.id} href={`/browse?category=${category.id}`}>
                  <div className={`relative overflow-hidden rounded-lg group cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1`} style={
                    category.id === '1' ? {backgroundImage: 'url(/home-cleaning.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'} :
                    category.id === '2' ? {backgroundImage: 'url(/plumbing.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'} :
                    category.id === '3' ? {backgroundImage: 'url(/electrical.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'} :
                    category.id === '4' ? {backgroundImage: 'url(/painting.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'} :
                    category.id === '7' ? {backgroundImage: 'url(/moving.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'} : 
                    category.id === '8' ? {backgroundImage: 'url(/cooking.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'} : {}
                  }>
                    {(category.id === '1' || category.id === '2' || category.id === '3' || category.id === '4' || category.id === '7' || category.id === '8') && <div className="absolute inset-0 bg-black/40 z-0"></div>}
                    <Card className={`text-center border-2 hover:border-[#8F210E] transition-all duration-300 h-40 flex flex-col justify-between ${(category.id === '1' || category.id === '2' || category.id === '3' || category.id === '4' || category.id === '7' || category.id === '8') ? 'bg-transparent border-transparent' : ''}`} hover={false}>
                    <div className="flex flex-col items-center relative z-10">
                      <div className="w-12 h-12 bg-[#8F210E] rounded-xl mb-3 flex items-center justify-center">
                        <SparklesIcon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className={`font-semibold transition-colors text-sm ${(category.id === '1' || category.id === '2' || category.id === '3' || category.id === '4' || category.id === '7' || category.id === '8') ? 'text-white group-hover:text-white' : 'text-gray-900 group-hover:text-[#8F210E]'}`}>
                        {t(`category.${getCategoryKey(category.name)}`)}
                      </h3>
                    </div>
                    <p className={`text-xs line-clamp-2 relative z-10 ${(category.id === '1' || category.id === '2' || category.id === '3' || category.id === '4' || category.id === '7' || category.id === '8') ? 'text-white' : 'text-gray-600'}`}>
                      {t(`category.${getCategoryKey(category.name)}_desc`)}
                    </p>
                    </Card>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t('how_it_works.title')}
              </h2>
              <p className="text-xl text-gray-600">
                {t('how_it_works.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-[#8F210E] rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('how_it_works.step_1_title')}</h3>
                <p className="text-gray-600">
                  {t('how_it_works.step_1_desc')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-[#8F210E] rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('how_it_works.step_2_title')}</h3>
                <p className="text-gray-600">
                  {t('how_it_works.step_2_desc')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-[#8F210E] rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('how_it_works.step_3_title')}</h3>
                <p className="text-gray-600">
                  {t('how_it_works.step_3_desc')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-primary rounded-3xl p-12 text-center text-white">
              <h2 className="text-4xl font-bold mb-4">
                Join thousands of satisfied customers
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Start your journey with Herafi today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button className="bg-white text-[#8F210E] hover:bg-gray-100 text-lg px-8 py-4">
                    Get Started as Customer
                  </Button>
                </Link>
                <Link href="/auth/signup?role=provider">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#8F210E] text-lg px-8 py-4">
                    Become a Provider
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center justify-center mt-8 space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-lg">4.8/5 from 10,000+ reviews</span>
              </div>
            </div>
          </div>
        </section>
      </main>


      {/* Auth Modals */}
      <SignInModal 
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSwitchToSignUp={switchToSignUp}
      />
      
      <SignUpModal 
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onSwitchToSignIn={switchToSignIn}
      />
    </div>
  );
}
