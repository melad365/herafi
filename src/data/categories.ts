import { ServiceCategory } from '@/types';

export const serviceCategories: ServiceCategory[] = [
  {
    id: '1',
    name: 'Home Cleaning',
    description: 'Professional house cleaning services',
    icon: 'SparklesIcon',
    subcategories: ['Deep Cleaning', 'Regular Cleaning', 'Move-in/Move-out', 'Post-Construction']
  },
  {
    id: '2',
    name: 'Plumbing',
    description: 'Professional plumbing repairs and installations',
    icon: 'WrenchIcon',
    subcategories: ['Emergency Repairs', 'Installation', 'Drain Cleaning', 'Water Heater']
  },
  {
    id: '3',
    name: 'Electrical',
    description: 'Licensed electrical services',
    icon: 'BoltIcon',
    subcategories: ['Wiring', 'Panel Upgrades', 'Lighting', 'Smart Home']
  },
  {
    id: '4',
    name: 'Painting',
    description: 'Interior and exterior painting services',
    icon: 'PaintBrushIcon',
    subcategories: ['Interior Painting', 'Exterior Painting', 'Cabinet Painting', 'Touch-ups']
  },
  {
    id: '5',
    name: 'Landscaping',
    description: 'Garden and lawn maintenance',
    icon: 'TreePineIcon',
    subcategories: ['Lawn Care', 'Garden Design', 'Tree Services', 'Irrigation']
  },
  {
    id: '6',
    name: 'Handyman',
    description: 'General home repairs and maintenance',
    icon: 'HammerIcon',
    subcategories: ['Furniture Assembly', 'Wall Mounting', 'Minor Repairs', 'Maintenance']
  },
  {
    id: '7',
    name: 'Moving',
    description: 'Moving and relocation services',
    icon: 'TruckIcon',
    subcategories: ['Local Moving', 'Long Distance', 'Packing', 'Storage']
  },
  {
    id: '8',
    name: 'Cooking',
    description: 'Cooking and cooking services',
    icon: 'HeartIcon',
    subcategories: ['Cooking', 'Home', 'Kitchen', 'Food']
  }
];