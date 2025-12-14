export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  profilePhoto?: string;
  role: 'customer' | 'provider' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Provider extends User {
  role: 'provider';
  businessName?: string;
  bio?: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  services: Service[];
  portfolio: PortfolioItem[];
  availability: AvailabilitySlot[];
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface Service {
  id: string;
  providerId: string;
  name: string;
  description: string;
  category: ServiceCategory;
  pricing: {
    type: 'fixed' | 'hourly';
    amount: number;
    currency: string;
  };
  duration?: number;
  skills: string[];
}

export interface PortfolioItem {
  id: string;
  providerId: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  createdAt: Date;
}

export interface AvailabilitySlot {
  id: string;
  providerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: Date;
  notes?: string;
  attachments?: string[];
  pricing: {
    amount: number;
    currency: string;
    platformFee: number;
  };
  paymentStatus: 'pending' | 'authorized' | 'captured' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number;
  comment: string;
  response?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  subcategories?: string[];
}

export interface SearchFilters {
  category?: string;
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  availability?: boolean;
  sortBy?: 'distance' | 'rating' | 'price' | 'reviews';
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface UserPreferences {
  notifications: NotificationSettings;
  language: string;
  currency: string;
}