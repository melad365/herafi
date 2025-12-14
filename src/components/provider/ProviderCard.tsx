import Link from 'next/link';
import { Provider } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  StarIcon, 
  MapPinIcon, 
  CheckBadgeIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import { StarIcon as StarFilledIcon } from '@heroicons/react/24/solid';

interface ProviderCardProps {
  provider: Provider;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarFilledIcon key={i} className="h-4 w-4 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="h-4 w-4 text-yellow-400" />
          <StarFilledIcon className="absolute inset-0 h-4 w-4 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  const primaryService = provider.services[0];

  return (
    <Card className="group">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <img
            src={provider.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
            alt={provider.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-[#8F210E] transition-colors">
                  {provider.businessName || provider.name}
                </h3>
                {provider.verified && (
                  <CheckBadgeIcon className="h-5 w-5 text-blue-500" />
                )}
              </div>
              
              <div className="flex items-center space-x-1 mt-1">
                <div className="flex items-center space-x-1">
                  {renderStars(provider.rating)}
                </div>
                <span className="text-sm text-gray-600 ml-2">
                  {provider.rating.toFixed(1)} ({provider.reviewCount} reviews)
                </span>
              </div>
              
              <div className="flex items-center space-x-1 mt-2 text-sm text-gray-500">
                <MapPinIcon className="h-4 w-4" />
                <span>{provider.location.address}</span>
              </div>
            </div>
            
            <div className="text-right">
              {primaryService && (
                <div className="text-lg font-semibold text-gray-900">
                  ${primaryService.pricing.amount}
                  {primaryService.pricing.type === 'hourly' ? '/hr' : ''}
                </div>
              )}
            </div>
          </div>
          
          <p className="text-gray-600 mt-3 line-clamp-2">
            {provider.bio}
          </p>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex flex-wrap gap-2">
              {provider.services.slice(0, 2).map((service) => (
                <span
                  key={service.id}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {service.name}
                </span>
              ))}
              {provider.services.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  +{provider.services.length - 2} more
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-xs text-green-600">
                <ClockIcon className="h-4 w-4" />
                <span>Available today</span>
              </div>
              <Link href={`/provider/${provider.id}`}>
                <Button size="sm">
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}