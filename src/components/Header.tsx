'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { User } from '@/types';
import { Button } from '@/components/ui/Button';
import { SearchBox } from '@/components/ui/SearchBox';
import { Avatar } from '@/components/ui/Avatar';
import { DropdownMenu, DropdownItem } from '@/components/ui/DropdownMenu';
import { Badge } from '@/components/ui/Badge';
import { 
  Bars3Icon, 
  XMarkIcon, 
  BellIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

interface HeaderProps {
  user?: User | null;
  onSignOut?: () => void;
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
}

export function Header({ user, onSignOut, onSignInClick, onSignUpClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Add search functionality here
  };

  const openSignInModal = () => {
    onSignInClick?.();
    setIsMenuOpen(false); // Close mobile menu if open
  };

  const openSignUpModal = () => {
    onSignUpClick?.();
    setIsMenuOpen(false); // Close mobile menu if open
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#8F210E] rounded-lg flex items-center justify-center">
                  <BuildingStorefrontIcon className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[#8F210E] font-modern tracking-tight">
                  Herafi
                </h1>
              </div>
            </Link>
            
            <nav className="hidden lg:ml-8 lg:flex lg:space-x-8">
              <Link href="/browse" className="text-gray-600 hover:text-[#8F210E] transition-colors font-medium">
                {t('header.browse_services')}
              </Link>
              {user?.role === 'provider' && (
                <Link href="/provider/dashboard" className="text-gray-600 hover:text-[#8F210E] transition-colors font-medium">
                  {t('header.my_business')}
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link href="/admin" className="text-gray-600 hover:text-[#8F210E] transition-colors font-medium">
                  {t('header.admin')}
                </Link>
              )}
            </nav>
          </div>

          {/* Search and User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Box */}
            <SearchBox
              placeholder="Search services..."
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              size="md"
              className="w-80"
            />

            {user ? (
              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:text-[#8F210E] hover:bg-gray-100 rounded-lg transition-all duration-200">
                  <BellIcon className="h-5 w-5" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    3
                  </Badge>
                </button>

                {/* User Menu */}
                <DropdownMenu
                  trigger={
                    <button className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <Avatar 
                        src={user.profilePhoto} 
                        alt={user.name}
                        size="sm"
                      />
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
                          {user.name}
                        </span>
                        <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                      </div>
                    </button>
                  }
                >
                  <DropdownItem href="/profile">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4" />
                      <span>Profile</span>
                    </div>
                  </DropdownItem>
                  <DropdownItem href="/settings">
                    <div className="flex items-center space-x-2">
                      <Cog6ToothIcon className="h-4 w-4" />
                      <span>Settings</span>
                    </div>
                  </DropdownItem>
                  <div className="border-t border-gray-100 my-1"></div>
                  <DropdownItem onClick={onSignOut}>
                    <div className="flex items-center space-x-2 text-red-600">
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      <span>{t('header.sign_out')}</span>
                    </div>
                  </DropdownItem>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="font-semibold"
                  onClick={openSignInModal}
                >
                  {t('header.sign_in')}
                </Button>
                <Button 
                  size="sm" 
                  className="font-semibold shadow-sm"
                  onClick={openSignUpModal}
                >
                  {t('header.get_started')}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <SearchBox
              placeholder="Search services..."
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              size="md"
              className="w-full"
            />
            
            {/* Mobile Navigation */}
            <div className="space-y-2">
              <Link 
                href="/browse" 
                className="block py-3 px-2 text-gray-600 hover:text-[#8F210E] hover:bg-gray-50 rounded-lg transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.browse_services')}
              </Link>
              {user?.role === 'provider' && (
                <Link 
                  href="/provider/dashboard" 
                  className="block py-3 px-2 text-gray-600 hover:text-[#8F210E] hover:bg-gray-50 rounded-lg transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('header.my_business')}
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link 
                  href="/admin" 
                  className="block py-3 px-2 text-gray-600 hover:text-[#8F210E] hover:bg-gray-50 rounded-lg transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('header.admin')}
                </Link>
              )}
            </div>

            {/* Mobile User Section */}
            {user ? (
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-3">
                  <Avatar 
                    src={user.profilePhoto} 
                    alt={user.name}
                    size="md"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {user.role}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link 
                    href="/profile" 
                    className="flex items-center space-x-3 py-2 px-3 text-gray-600 hover:bg-gray-50 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserIcon className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  <Link 
                    href="/settings" 
                    className="flex items-center space-x-3 py-2 px-3 text-gray-600 hover:bg-gray-50 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Cog6ToothIcon className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                  <button 
                    onClick={() => {
                      onSignOut?.();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 py-2 px-3 text-red-600 hover:bg-red-50 rounded-lg w-full"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span>{t('header.sign_out')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-center font-semibold"
                  onClick={openSignInModal}
                >
                  {t('header.sign_in')}
                </Button>
                <Button 
                  size="sm" 
                  className="w-full justify-center font-semibold"
                  onClick={openSignUpModal}
                >
                  {t('header.get_started')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

    </header>
  );
}