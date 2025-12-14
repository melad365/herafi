'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations = {
  en: {
    // Header
    'header.browse_services': 'Browse Services',
    'header.my_business': 'My Business',
    'header.admin': 'Admin',
    'header.sign_out': 'Sign Out',
    'header.sign_in': 'Sign In',
    'header.get_started': 'Get Started',

    // Hero Section
    'hero.title_1': 'Find the perfect',
    'hero.title_2': 'local services',
    'hero.subtitle': 'Connect with skilled professionals in your area. From cleaning to repairs, get quality service at the right price.',
    'hero.search_placeholder': 'What service do you need?',
    'hero.search_button': 'Search',
    'hero.popular': 'Popular:',

    // Services Section
    'services.title': 'Explore Services',
    'services.subtitle': 'Browse our categories and find the perfect professional for your needs',

    // How It Works Section
    'how_it_works.title': 'How it works',
    'how_it_works.subtitle': 'Get started in just a few simple steps',
    'how_it_works.step_1_title': 'Browse & Compare',
    'how_it_works.step_1_desc': 'Search our marketplace to find the right professional for your needs. Compare profiles, ratings, and pricing.',
    'how_it_works.step_2_title': 'Book & Pay',
    'how_it_works.step_2_desc': 'Request a service and securely pay online. Your payment is protected until the job is completed.',
    'how_it_works.step_3_title': 'Get It Done',
    'how_it_works.step_3_desc': 'Receive quality service from verified professionals. Rate and review to help others in the community.',

    // CTA Section
    'cta.title': 'Join thousands of satisfied customers',
    'cta.subtitle': 'Start your journey with Herafi today',
    'cta.customer_button': 'Get Started as Customer',
    'cta.provider_button': 'Become a Provider',

    // Footer
    'footer.customers': 'For Customers',
    'footer.providers': 'For Providers',
    'footer.company': 'Company',
    'footer.support': 'Support',
    'footer.browse_services': 'Browse Services',
    'footer.how_it_works': 'How it Works',
    'footer.sign_up': 'Sign Up',
    'footer.login': 'Login',
    'footer.join_us': 'Join Us',
    'footer.provider_dashboard': 'Provider Dashboard',
    'footer.pricing': 'Pricing',
    'footer.about': 'About',
    'footer.careers': 'Careers',
    'footer.contact': 'Contact',
    'footer.help_center': 'Help Center',
    'footer.contact_us': 'Contact Us',
    'footer.safety': 'Safety',
    'footer.tagline': 'Connecting customers with skilled local service providers.',
    'footer.copyright': '2025 Herafi. All rights reserved.',

    // Loading
    'loading.text': 'Loading...',

    // Service Categories
    'category.home_cleaning': 'Home Cleaning',
    'category.home_cleaning_desc': 'Professional house cleaning services',
    'category.plumbing': 'Plumbing',
    'category.plumbing_desc': 'Professional plumbing repairs and installations',
    'category.electrical': 'Electrical',
    'category.electrical_desc': 'Licensed electrical services',
    'category.painting': 'Painting',
    'category.painting_desc': 'Interior and exterior painting services',
    'category.landscaping': 'Landscaping',
    'category.landscaping_desc': 'Garden and lawn maintenance',
    'category.handyman': 'Handyman',
    'category.handyman_desc': 'General home repairs and maintenance',
    'category.moving': 'Moving',
    'category.moving_desc': 'Moving and relocation services',
    'category.cooking': 'Cooking',
    'category.cooking_desc': 'Cooking and cooking services',
  },
  ar: {
    // Header
    'header.browse_services': 'تصفح الخدمات',
    'header.my_business': 'أعمالي',
    'header.admin': 'الإدارة',
    'header.sign_out': 'تسجيل خروج',
    'header.sign_in': 'تسجيل دخول',
    'header.get_started': 'ابدأ الآن',

    // Hero Section
    'hero.title_1': 'اعثر على',
    'hero.title_2': 'الخدمات المحلية المثالية',
    'hero.subtitle': 'تواصل مع المتخصصين المهرة في منطقتك. من التنظيف إلى الإصلاحات، احصل على خدمة عالية الجودة بالسعر المناسب.',
    'hero.search_placeholder': 'ما الخدمة التي تحتاجها؟',
    'hero.search_button': 'بحث',
    'hero.popular': 'شائع:',

    // Services Section
    'services.title': 'استكشف الخدمات',
    'services.subtitle': 'تصفح فئاتنا واعثر على المختص المناسب لاحتياجاتك',

    // How It Works Section
    'how_it_works.title': 'كيف تعمل',
    'how_it_works.subtitle': 'ابدأ في خطوات بسيطة',
    'how_it_works.step_1_title': 'تصفح وقارن',
    'how_it_works.step_1_desc': 'ابحث في سوقنا للعثور على المختص المناسب لاحتياجاتك. قارن الملفات الشخصية والتقييمات والأسعار.',
    'how_it_works.step_2_title': 'احجز وادفع',
    'how_it_works.step_2_desc': 'اطلب خدمة وادفع بأمان عبر الإنترنت. دفعتك محمية حتى اكتمال العمل.',
    'how_it_works.step_3_title': 'أنجز العمل',
    'how_it_works.step_3_desc': 'احصل على خدمة عالية الجودة من متخصصين معتمدين. قيم واكتب مراجعة لمساعدة الآخرين في المجتمع.',

    // CTA Section
    'cta.title': 'انضم إلى آلاف العملاء الراضين',
    'cta.subtitle': 'ابدأ رحلتك مع حرفي اليوم',
    'cta.customer_button': 'ابدأ كعميل',
    'cta.provider_button': 'كن مقدم خدمة',

    // Footer
    'footer.customers': 'للعملاء',
    'footer.providers': 'لمقدمي الخدمة',
    'footer.company': 'الشركة',
    'footer.support': 'الدعم',
    'footer.browse_services': 'تصفح الخدمات',
    'footer.how_it_works': 'كيف تعمل',
    'footer.sign_up': 'التسجيل',
    'footer.login': 'تسجيل الدخول',
    'footer.join_us': 'انضم إلينا',
    'footer.provider_dashboard': 'لوحة مقدم الخدمة',
    'footer.pricing': 'الأسعار',
    'footer.about': 'حول',
    'footer.careers': 'الوظائف',
    'footer.contact': 'اتصل بنا',
    'footer.help_center': 'مركز المساعدة',
    'footer.contact_us': 'اتصل بنا',
    'footer.safety': 'الأمان',
    'footer.tagline': 'ربط العملاء بمقدمي الخدمات المحليين المهرة.',
    'footer.copyright': '2025 حرفي. جميع الحقوق محفوظة.',

    // Loading
    'loading.text': '...جاري التحميل',

    // Service Categories
    'category.home_cleaning': 'تنظيف المنازل',
    'category.home_cleaning_desc': 'خدمات تنظيف المنازل المهنية',
    'category.plumbing': 'السباكة',
    'category.plumbing_desc': 'إصلاحات وتركيبات السباكة المهنية',
    'category.electrical': 'الكهرباء',
    'category.electrical_desc': 'خدمات كهربائية مرخصة',
    'category.painting': 'الطلاء',
    'category.painting_desc': 'خدمات الطلاء الداخلي والخارجي',
    'category.landscaping': 'تنسيق الحدائق',
    'category.landscaping_desc': 'صيانة الحدائق والمروج',
    'category.handyman': 'الأعمال اليدوية',
    'category.handyman_desc': 'إصلاحات وصيانة المنازل العامة',
    'category.moving': 'النقل',
    'category.moving_desc': 'خدمات النقل والانتقال',
    'category.cooking': 'الطبخ',
    'category.cooking_desc': 'خدمات الطبخ والطعام المنزلية',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Initialize language from localStorage if available
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
        return savedLanguage;
      }
    }
    return 'en';
  });

  useEffect(() => {
    // Save language to localStorage
    localStorage.setItem('language', language);
    
    // Update document direction
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}