'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ProviderCard } from '@/components/provider/ProviderCard';
import { providers } from '@/data/users';
import { serviceCategories } from '@/data/categories';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  MapIcon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

export default function BrowsePage() {
  const { user, logout } = useAuth();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'price'>('rating');
  const [filters, setFilters] = useState({
    minRating: 0,
    maxPrice: 1000,
    verified: false,
    availableToday: false
  });

  const filteredProviders = useMemo(() => {
    let filtered = [...providers];

    if (searchQuery) {
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.services.some(service => 
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      const category = serviceCategories.find(cat => cat.id === selectedCategory);
      if (category) {
        filtered = filtered.filter(provider =>
          provider.services.some(service => 
            service.category.name === category.name
          )
        );
      }
    }

    if (filters.minRating > 0) {
      filtered = filtered.filter(provider => provider.rating >= filters.minRating);
    }

    if (filters.verified) {
      filtered = filtered.filter(provider => provider.verified);
    }

    const maxServicePrice = Math.max(...providers.flatMap(p => p.services.map(s => s.pricing.amount)));
    if (filters.maxPrice < maxServicePrice) {
      filtered = filtered.filter(provider =>
        provider.services.some(service => service.pricing.amount <= filters.maxPrice)
      );
    }

    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        filtered.sort((a, b) => {
          const minPriceA = Math.min(...a.services.map(s => s.pricing.amount));
          const minPriceB = Math.min(...b.services.map(s => s.pricing.amount));
          return minPriceA - minPriceB;
        });
        break;
      case 'distance':
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onSignOut={logout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find Service Providers
          </h1>
          
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by service, provider name, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-300">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-[#8F210E] text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'map' 
                      ? 'bg-[#8F210E] text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MapIcon className="h-5 w-5" />
                </button>
              </div>
              
              <Button variant="outline" size="sm">
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value="all"
                    checked={selectedCategory === 'all'}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-sm">All Categories</span>
                </label>
                {serviceCategories.map((category) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={category.id}
                      checked={selectedCategory === category.id}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-sm">{category.name}</span>
                  </label>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Sort By</h3>
              <div className="space-y-2">
                {[
                  { value: 'rating', label: 'Highest Rated' },
                  { value: 'price', label: 'Lowest Price' },
                  { value: 'distance', label: 'Distance' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="sort"
                      value={option.value}
                      checked={sortBy === option.value}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="mr-3"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters({...filters, minRating: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value={0}>Any Rating</option>
                    <option value={3}>3+ Stars</option>
                    <option value={4}>4+ Stars</option>
                    <option value={4.5}>4.5+ Stars</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price: ${filters.maxPrice}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1000}
                    step={50}
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.verified}
                      onChange={(e) => setFilters({...filters, verified: e.target.checked})}
                      className="mr-3"
                    />
                    <span className="text-sm">Verified Only</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.availableToday}
                      onChange={(e) => setFilters({...filters, availableToday: e.target.checked})}
                      className="mr-3"
                    />
                    <span className="text-sm">Available Today</span>
                  </label>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Found {filteredProviders.length} service providers
              </p>
              
              {selectedCategory !== 'all' && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Category:</span>
                  <span className="px-3 py-1 bg-[#8F210E] text-white text-sm rounded-full">
                    {serviceCategories.find(cat => cat.id === selectedCategory)?.name}
                  </span>
                </div>
              )}
            </div>

            {viewMode === 'list' ? (
              <div className="space-y-6">
                {filteredProviders.length > 0 ? (
                  filteredProviders.map((provider) => (
                    <ProviderCard key={provider.id} provider={provider} />
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <div className="text-gray-500">
                      <AdjustmentsHorizontalIcon className="h-12 w-12 mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">No providers found</p>
                      <p>Try adjusting your search criteria or filters</p>
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="text-gray-500">
                  <MapIcon className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Map View</p>
                  <p>Interactive map functionality would be implemented here</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}