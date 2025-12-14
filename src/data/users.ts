import { User, Provider } from '@/types';

export const users: User[] = [
  {
    id: '1',
    email: 'sarah.customer@example.com',
    name: 'Sarah Johnson',
    phone: '+1-555-0123',
    address: '123 Main St, San Francisco, CA 94102',
    profilePhoto: 'https://images.unsplash.com/photo-1494790108755-2616b1e5c1a3?w=150',
    role: 'customer',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: '2',
    email: 'mike.customer@example.com',
    name: 'Mike Chen',
    phone: '+1-555-0124',
    address: '456 Oak Ave, San Francisco, CA 94110',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'customer',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-11-28')
  },
  {
    id: 'admin1',
    email: 'admin@herafi.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01')
  }
];

export const providers: Provider[] = [
  {
    id: 'p1',
    email: 'maria.cleaning@example.com',
    name: 'Maria Santos',
    phone: '+1-555-0201',
    address: '789 Pine St, San Francisco, CA 94109',
    profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    role: 'provider',
    businessName: 'Sparkle Clean Services',
    bio: 'Professional house cleaner with 8+ years experience. Specializing in deep cleaning and eco-friendly products.',
    verified: true,
    rating: 4.8,
    reviewCount: 127,
    services: [
      {
        id: 's1',
        providerId: 'p1',
        name: 'Deep House Cleaning',
        description: 'Complete deep cleaning service including kitchen, bathrooms, and all living areas',
        category: {
          id: '1',
          name: 'Home Cleaning',
          description: 'Professional house cleaning services',
          icon: 'SparklesIcon'
        },
        pricing: {
          type: 'fixed',
          amount: 120,
          currency: 'USD'
        },
        duration: 240,
        skills: ['Deep Cleaning', 'Eco-friendly', 'Detail-oriented']
      }
    ],
    portfolio: [
      {
        id: 'port1',
        providerId: 'p1',
        title: 'Kitchen Deep Clean',
        description: 'Complete kitchen transformation',
        images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'],
        tags: ['kitchen', 'deep-clean'],
        createdAt: new Date('2024-10-15')
      }
    ],
    availability: [
      {
        id: 'av1',
        providerId: 'p1',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '17:00',
        isAvailable: true
      },
      {
        id: 'av2',
        providerId: 'p1',
        dayOfWeek: 2,
        startTime: '08:00',
        endTime: '17:00',
        isAvailable: true
      }
    ],
    location: {
      lat: 37.7749,
      lng: -122.4194,
      address: '789 Pine St, San Francisco, CA 94109'
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: 'p2',
    email: 'john.plumber@example.com',
    name: 'John Rodriguez',
    phone: '+1-555-0202',
    address: '321 Elm St, San Francisco, CA 94107',
    profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    role: 'provider',
    businessName: 'Rodriguez Plumbing',
    bio: 'Licensed plumber with 15+ years experience. Emergency repairs, installations, and maintenance.',
    verified: true,
    rating: 4.9,
    reviewCount: 89,
    services: [
      {
        id: 's2',
        providerId: 'p2',
        name: 'Emergency Plumbing Repair',
        description: 'Quick response plumbing repairs for urgent issues',
        category: {
          id: '2',
          name: 'Plumbing',
          description: 'Professional plumbing repairs and installations',
          icon: 'WrenchIcon'
        },
        pricing: {
          type: 'hourly',
          amount: 85,
          currency: 'USD'
        },
        duration: 60,
        skills: ['Emergency Repair', 'Licensed', 'Fast Response']
      }
    ],
    portfolio: [
      {
        id: 'port2',
        providerId: 'p2',
        title: 'Bathroom Renovation Plumbing',
        description: 'Complete bathroom plumbing installation',
        images: ['https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400'],
        tags: ['bathroom', 'renovation', 'installation'],
        createdAt: new Date('2024-09-20')
      }
    ],
    availability: [
      {
        id: 'av3',
        providerId: 'p2',
        dayOfWeek: 0,
        startTime: '06:00',
        endTime: '20:00',
        isAvailable: true
      },
      {
        id: 'av4',
        providerId: 'p2',
        dayOfWeek: 1,
        startTime: '06:00',
        endTime: '20:00',
        isAvailable: true
      }
    ],
    location: {
      lat: 37.7849,
      lng: -122.4094,
      address: '321 Elm St, San Francisco, CA 94107'
    },
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: 'p3',
    email: 'lisa.painter@example.com',
    name: 'Lisa Thompson',
    phone: '+1-555-0203',
    address: '567 Maple Dr, San Francisco, CA 94114',
    profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    role: 'provider',
    businessName: 'Thompson Painting Co.',
    bio: 'Professional painter specializing in interior design and color consultation.',
    verified: true,
    rating: 4.7,
    reviewCount: 156,
    services: [
      {
        id: 's3',
        providerId: 'p3',
        name: 'Interior Room Painting',
        description: 'Professional interior painting with premium materials',
        category: {
          id: '4',
          name: 'Painting',
          description: 'Interior and exterior painting services',
          icon: 'PaintBrushIcon'
        },
        pricing: {
          type: 'fixed',
          amount: 450,
          currency: 'USD'
        },
        duration: 480,
        skills: ['Interior Design', 'Color Consultation', 'Premium Materials']
      }
    ],
    portfolio: [
      {
        id: 'port3',
        providerId: 'p3',
        title: 'Living Room Transformation',
        description: 'Modern color scheme transformation',
        images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'],
        tags: ['living-room', 'modern', 'color-consultation'],
        createdAt: new Date('2024-11-01')
      }
    ],
    availability: [
      {
        id: 'av5',
        providerId: 'p3',
        dayOfWeek: 2,
        startTime: '07:00',
        endTime: '16:00',
        isAvailable: true
      },
      {
        id: 'av6',
        providerId: 'p3',
        dayOfWeek: 3,
        startTime: '07:00',
        endTime: '16:00',
        isAvailable: true
      }
    ],
    location: {
      lat: 37.7649,
      lng: -122.4394,
      address: '567 Maple Dr, San Francisco, CA 94114'
    },
    createdAt: new Date('2024-03-12'),
    updatedAt: new Date('2024-12-01')
  }
];

export const authUsers = [
  { email: 'sarah.customer@example.com', password: '1234', user: users[0] },
  { email: 'mike.customer@example.com', password: '1234', user: users[1] },
  { email: 'admin@herafi.com', password: '1234', user: users[2] },
  { email: 'maria.cleaning@example.com', password: '1234', user: providers[0] },
  { email: 'john.plumber@example.com', password: '1234', user: providers[1] },
  { email: 'lisa.painter@example.com', password: '1234', user: providers[2] },
];