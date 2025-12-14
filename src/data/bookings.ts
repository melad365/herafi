import { Booking, Review } from '@/types';

export const bookings: Booking[] = [
  {
    id: 'b1',
    customerId: '1',
    providerId: 'p1',
    serviceId: 's1',
    status: 'completed',
    scheduledDate: new Date('2024-11-20T10:00:00'),
    notes: 'Please focus on the kitchen and bathrooms',
    pricing: {
      amount: 120,
      currency: 'USD',
      platformFee: 12
    },
    paymentStatus: 'captured',
    createdAt: new Date('2024-11-18'),
    updatedAt: new Date('2024-11-20')
  },
  {
    id: 'b2',
    customerId: '2',
    providerId: 'p2',
    serviceId: 's2',
    status: 'accepted',
    scheduledDate: new Date('2024-12-15T14:00:00'),
    notes: 'Kitchen sink is completely blocked',
    pricing: {
      amount: 85,
      currency: 'USD',
      platformFee: 8.5
    },
    paymentStatus: 'authorized',
    createdAt: new Date('2024-12-13'),
    updatedAt: new Date('2024-12-13')
  },
  {
    id: 'b3',
    customerId: '1',
    providerId: 'p3',
    serviceId: 's3',
    status: 'requested',
    scheduledDate: new Date('2024-12-18T09:00:00'),
    notes: 'Looking for a warm, welcoming color for the living room',
    pricing: {
      amount: 450,
      currency: 'USD',
      platformFee: 45
    },
    paymentStatus: 'pending',
    createdAt: new Date('2024-12-12'),
    updatedAt: new Date('2024-12-12')
  }
];

export const reviews: Review[] = [
  {
    id: 'r1',
    bookingId: 'b1',
    customerId: '1',
    providerId: 'p1',
    rating: 5,
    comment: 'Maria did an absolutely fantastic job! My house has never been so clean. She was professional, thorough, and used eco-friendly products as promised. Highly recommended!',
    response: 'Thank you so much Sarah! It was a pleasure working on your beautiful home. Looking forward to helping you again soon!',
    createdAt: new Date('2024-11-21'),
    updatedAt: new Date('2024-11-22')
  },
  {
    id: 'r2',
    bookingId: 'fake-booking-1',
    customerId: '2',
    providerId: 'p1',
    rating: 5,
    comment: 'Excellent service! Maria was on time, professional, and left my apartment spotless.',
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-10-15')
  },
  {
    id: 'r3',
    bookingId: 'fake-booking-2',
    customerId: '1',
    providerId: 'p2',
    rating: 5,
    comment: 'John fixed our emergency plumbing issue quickly and efficiently. Great communication and fair pricing.',
    response: 'Thanks for the review! Happy to help anytime.',
    createdAt: new Date('2024-09-28'),
    updatedAt: new Date('2024-09-29')
  }
];