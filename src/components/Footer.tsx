'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

export function Footer() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-[#8F210E] mb-4 font-modern">Herafi</h3>
            <p className="text-gray-300">
              {t('footer.tagline')}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('footer.customers')}</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/browse" className="hover:text-white">{t('footer.browse_services')}</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white">{t('footer.how_it_works')}</Link></li>
              <li><Link href="/customer-protection" className="hover:text-white">Customer Protection</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('footer.providers')}</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/become-provider" className="hover:text-white">{t('footer.join_us')}</Link></li>
              <li><Link href="/provider-resources" className="hover:text-white">Resources</Link></li>
              <li><Link href="/provider-success" className="hover:text-white">Success Stories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('footer.support')}</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/help" className="hover:text-white">{t('footer.help_center')}</Link></li>
              <li><Link href="/contact" className="hover:text-white">{t('footer.contact_us')}</Link></li>
              <li><Link href="/safety" className="hover:text-white">{t('footer.safety')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-center sm:text-left">&copy; {t('footer.copyright')}</p>
            
            {/* Language Toggle */}
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <GlobeAltIcon className="h-5 w-5 text-gray-400" />
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded transition-colors ${
                    language === 'en' 
                      ? 'bg-[#8F210E] text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('ar')}
                  className={`px-3 py-1 rounded transition-colors ${
                    language === 'ar' 
                      ? 'bg-[#8F210E] text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  AR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}