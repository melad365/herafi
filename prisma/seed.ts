import { PrismaClient, Category } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { faker, fakerAR, fakerEN } from '@faker-js/faker';
import 'dotenv/config';

// Initialize PrismaClient with pg adapter (same pattern as src/lib/db.ts)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Deterministic seed for reproducibility (SEED-06)
const SEED_VALUE = 42;
faker.seed(SEED_VALUE);
fakerAR.seed(SEED_VALUE);
fakerEN.seed(SEED_VALUE);

// All 13 categories from schema
const CATEGORIES: Category[] = [
  'PLUMBING',
  'PAINTING',
  'CLEANING',
  'CARPENTRY',
  'WELDING',
  'ELECTRICAL',
  'HVAC',
  'LANDSCAPING',
  'MOVING',
  'CAR_WASHING',
  'DIGITAL_DESIGN',
  'DIGITAL_WRITING',
  'OTHER',
];

// Cleanup in reverse dependency order (SEED-05)
// Reviews → Orders → Conversations/Messages → Gigs → PortfolioImages → Users
async function cleanup() {
  console.log('🧹 Cleaning up existing seed data...');

  // Delete in reverse dependency order to respect foreign keys
  await prisma.review.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.gig.deleteMany({});
  await prisma.portfolioImage.deleteMany({});
  // Only delete seed users (identified by @herafi-seed.test email)
  await prisma.user.deleteMany({
    where: { email: { endsWith: '@herafi-seed.test' } },
  });

  console.log('✅ Cleanup complete');
}

// Helper function: Generate category-appropriate gig title
function generateCategoryTitle(category: Category): string {
  const templates: Record<Category, string[]> = {
    PLUMBING: [
      'Professional Plumbing Repair',
      'Emergency Plumbing Services',
      'Drain Cleaning & Pipe Repair',
    ],
    PAINTING: [
      'Interior & Exterior Painting',
      'Professional House Painting',
      'Wall Painting & Finishing',
    ],
    CLEANING: [
      'Deep House Cleaning',
      'Office Cleaning Services',
      'Move-In/Out Cleaning',
    ],
    CARPENTRY: [
      'Custom Carpentry Work',
      'Furniture Repair & Assembly',
      'Cabinet Installation',
    ],
    WELDING: [
      'Metal Fabrication & Welding',
      'Custom Welding Projects',
      'Repair Welding Services',
    ],
    ELECTRICAL: [
      'Electrical Repair & Installation',
      'Wiring & Lighting Setup',
      'Electrical Troubleshooting',
    ],
    HVAC: [
      'HVAC Installation & Repair',
      'AC Maintenance Services',
      'Heating System Repair',
    ],
    LANDSCAPING: [
      'Garden Design & Landscaping',
      'Lawn Maintenance Services',
      'Tree Trimming & Care',
    ],
    MOVING: [
      'Residential Moving Services',
      'Furniture Moving & Packing',
      'Office Relocation',
    ],
    CAR_WASHING: [
      'Premium Car Wash & Detailing',
      'Mobile Car Cleaning',
      'Auto Detailing Services',
    ],
    DIGITAL_DESIGN: [
      'Graphic Design Services',
      'Logo & Brand Design',
      'Web Design & UI/UX',
    ],
    DIGITAL_WRITING: [
      'Content Writing Services',
      'Blog Post Writing',
      'Copywriting & Editing',
    ],
    OTHER: ['Professional Services', 'Custom Solutions', 'Expert Assistance'],
  };

  return faker.helpers.arrayElement(templates[category]);
}

// Helper function: Generate category description
function generateCategoryDescription(category: Category): string {
  const intro = faker.lorem.paragraph();
  const skills = faker.lorem.paragraph();
  const promise = faker.lorem.sentence();

  return `${intro}\n\n${skills}\n\n${promise}`;
}

// Helper function: Generate category-specific pricing tiers
function generateCategoryPricing(category: Category): object {
  const ranges: Record<
    Category,
    {
      basic: [number, number];
      standard: [number, number];
      premium: [number, number];
    }
  > = {
    PLUMBING: { basic: [75, 150], standard: [150, 300], premium: [300, 600] },
    PAINTING: { basic: [100, 200], standard: [200, 400], premium: [400, 800] },
    CLEANING: { basic: [50, 100], standard: [100, 200], premium: [200, 400] },
    CARPENTRY: { basic: [60, 120], standard: [120, 250], premium: [250, 500] },
    WELDING: { basic: [80, 150], standard: [150, 300], premium: [300, 600] },
    ELECTRICAL: {
      basic: [75, 150],
      standard: [150, 300],
      premium: [300, 600],
    },
    HVAC: { basic: [100, 200], standard: [200, 500], premium: [500, 1200] },
    LANDSCAPING: {
      basic: [60, 120],
      standard: [120, 250],
      premium: [250, 500],
    },
    MOVING: { basic: [100, 200], standard: [200, 400], premium: [400, 800] },
    CAR_WASHING: {
      basic: [30, 60],
      standard: [60, 120],
      premium: [120, 250],
    },
    DIGITAL_DESIGN: {
      basic: [50, 100],
      standard: [100, 250],
      premium: [250, 600],
    },
    DIGITAL_WRITING: {
      basic: [40, 80],
      standard: [80, 150],
      premium: [150, 300],
    },
    OTHER: { basic: [50, 100], standard: [100, 200], premium: [200, 400] },
  };

  const range = ranges[category];

  return {
    basic: {
      name: 'Basic',
      price: faker.number.int({ min: range.basic[0], max: range.basic[1] }),
      description: faker.lorem.sentence(),
      deliveryDays: faker.number.int({ min: 3, max: 7 }),
    },
    standard: {
      name: 'Standard',
      price: faker.number.int({
        min: range.standard[0],
        max: range.standard[1],
      }),
      description: faker.lorem.sentence(),
      deliveryDays: faker.number.int({ min: 5, max: 10 }),
    },
    premium: {
      name: 'Premium',
      price: faker.number.int({
        min: range.premium[0],
        max: range.premium[1],
      }),
      description: faker.lorem.sentence(),
      deliveryDays: faker.number.int({ min: 7, max: 14 }),
    },
  };
}

// Seed users — Create 15 provider profiles with mixed locales
async function seedUsers() {
  console.log('👤 Seeding users...');

  const PROVIDER_COUNT = 15;
  const providers = [];

  for (let i = 0; i < PROVIDER_COUNT; i++) {
    // Alternate between Arabic and English names for diversity
    const useArabic = i % 2 === 0;
    const localeFaker = useArabic ? fakerAR : fakerEN;

    const email = `provider${i + 1}@herafi-seed.test`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: localeFaker.person.fullName(),
        username: fakerEN.internet.username().toLowerCase(),
        avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`,
        isProvider: true,
        providerBio: localeFaker.lorem.paragraph(),
        professionalSummary: localeFaker.lorem.paragraphs(2),
        skills: [], // Will be set after gigs created
        yearsOfExperience: faker.number.int({ min: 1, max: 20 }),
        certifications: [],
        hashedPassword: null,
      },
    });

    providers.push(user);
  }

  console.log(`✅ Seeded ${PROVIDER_COUNT} providers`);
  return providers;
}

// Seed gigs — Create 1-3 gigs per provider with category distribution
async function seedGigs() {
  console.log('🛠️ Seeding gigs...');

  const providers = await prisma.user.findMany({
    where: { email: { endsWith: '@herafi-seed.test' }, isProvider: true },
  });

  let categoryIndex = 0;
  let totalGigs = 0;

  for (const provider of providers) {
    const numGigs = faker.number.int({ min: 1, max: 3 });

    for (let i = 0; i < numGigs; i++) {
      // Round-robin ensures all categories covered
      const category = CATEGORIES[categoryIndex % CATEGORIES.length];
      categoryIndex++;

      const title = generateCategoryTitle(category);
      const slug = `${faker.helpers.slugify(title).toLowerCase()}-${provider.id.slice(0, 8)}-${i}`;

      await prisma.gig.upsert({
        where: { slug },
        update: {},
        create: {
          slug,
          title,
          description: generateCategoryDescription(category),
          category,
          images: [
            `https://picsum.photos/seed/${slug}-1/800/600`,
            `https://picsum.photos/seed/${slug}-2/800/600`,
          ],
          pricingTiers: generateCategoryPricing(category),
          providerId: provider.id,
          isActive: true,
        },
      });

      totalGigs++;
    }

    // Update provider skills based on gigs they've created
    const providerGigs = await prisma.gig.findMany({
      where: { providerId: provider.id },
      select: { category: true },
    });

    const skills = providerGigs.map((g) => g.category);
    await prisma.user.update({
      where: { id: provider.id },
      data: { skills },
    });
  }

  console.log(`✅ Seeded ${totalGigs} gigs across ${CATEGORIES.length} categories`);
}

// Seed orders — Create buyer accounts and completed orders
async function seedOrders() {
  console.log('📦 Seeding orders...');

  // 1. Create 4 buyer accounts
  const buyers = [];
  for (let i = 0; i < 4; i++) {
    const email = `buyer${i + 1}@herafi-seed.test`;
    const buyer = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: faker.person.fullName(),
        username: fakerEN.internet.username().toLowerCase(),
        avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`,
        isProvider: false,
        hashedPassword: null,
      },
    });
    buyers.push(buyer);
  }
  console.log(`✅ Created ${buyers.length} buyer accounts`);

  // 2. Fetch all gigs with provider info
  const gigs = await prisma.gig.findMany({ include: { provider: true } });

  // 3. Create 3-6 completed orders per gig
  let totalOrders = 0;
  for (const gig of gigs) {
    const numOrders = faker.number.int({ min: 3, max: 6 });

    for (let i = 0; i < numOrders; i++) {
      // Select buyer - ensure buyer is NOT the provider
      let buyer;
      let attempts = 0;
      do {
        buyer = faker.helpers.arrayElement(buyers);
        attempts++;
        if (attempts > 10) {
          console.warn(`Could not find suitable buyer for gig ${gig.id}`);
          break;
        }
      } while (buyer.id === gig.providerId);

      // Skip if we couldn't find a suitable buyer
      if (buyer.id === gig.providerId) continue;

      // Select tier
      const tier = faker.helpers.arrayElement([
        'basic',
        'standard',
        'premium',
      ] as const);
      const tierData = (gig.pricingTiers as any)[tier];

      // Generate realistic timestamps (ensure enough time for completion)
      // Create orders 3-12 months in the past to ensure completion time
      const monthsAgo = faker.number.int({ min: 3, max: 12 });
      const createdAt = faker.date.past({ years: 1, refDate: new Date() });
      // Ensure createdAt is at least 30 days before now
      const minCreatedAt = new Date();
      minCreatedAt.setDate(minCreatedAt.getDate() - 30);
      if (createdAt > minCreatedAt) {
        createdAt.setMonth(createdAt.getMonth() - 1);
      }

      const acceptedAt = new Date(createdAt.getTime() + 1000 * 60 * 60); // +1 hour
      const startedAt = new Date(acceptedAt.getTime() + 1000 * 60 * 60 * 24); // +1 day
      const minCompletedAt = new Date(startedAt.getTime() + 1000 * 60 * 60 * 24); // +1 day from start
      const now = new Date();

      // Ensure we have valid range for faker.date.between
      const completedAt =
        minCompletedAt < now
          ? faker.date.between({ from: minCompletedAt, to: now })
          : new Date(minCompletedAt.getTime() + 1000 * 60 * 60 * 24); // +1 day if range invalid

      await prisma.order.create({
        data: {
          buyerId: buyer.id,
          providerId: gig.providerId,
          gigId: gig.id,
          selectedTier: tier,
          tierSnapshot: tierData,
          totalPrice: tierData.price,
          status: 'COMPLETED',
          paymentConfirmed: true,
          createdAt,
          acceptedAt,
          startedAt,
          completedAt,
        },
      });

      totalOrders++;
    }
  }

  console.log(`✅ Seeded ${totalOrders} completed orders`);
}

// Helper: Generate bell curve rating distribution
function generateRating(): number {
  // Bell curve distribution for realistic marketplace ratings (SEED-17)
  // Rating is Int in schema, so return whole numbers 3-5
  const roll = faker.number.int({ min: 1, max: 100 });
  if (roll <= 25) return 5; // 25% five-star
  if (roll <= 70) return 4; // 45% four-star (cumulative 70%)
  if (roll <= 90) return 4; // 20% four-star (gives 4-star heavy weight)
  return 3; // 10% three-star (minimum realistic)
}

// Seed reviews — Create 3-8 reviews per provider
async function seedReviews() {
  console.log('⭐ Seeding reviews...');

  // Get all providers with their completed orders
  const providers = await prisma.user.findMany({
    where: { isProvider: true, email: { endsWith: '@herafi-seed.test' } },
    include: {
      providerOrders: {
        where: { status: 'COMPLETED' },
        orderBy: { completedAt: 'asc' },
      },
    },
  });

  let totalReviews = 0;
  for (const provider of providers) {
    const availableOrders = provider.providerOrders;
    if (availableOrders.length === 0) continue;

    // Target 3-8 reviews per provider, but don't exceed available orders
    const targetReviews = Math.min(
      faker.number.int({ min: 3, max: 8 }),
      availableOrders.length
    );

    // Randomly select orders to review
    const ordersToReview = faker.helpers.shuffle(availableOrders).slice(0, targetReviews);

    for (const order of ordersToReview) {
      // Generate rating using bell curve
      const rating = generateRating();

      // Vary review content length (SEED-18)
      const lengthRoll = faker.number.int({ min: 1, max: 3 });
      let content: string;
      if (lengthRoll === 1) content = faker.lorem.sentence(); // Short
      else if (lengthRoll === 2) content = faker.lorem.paragraph(); // Medium
      else content = faker.lorem.paragraphs(2); // Long

      // Review created between order completion and now (SEED-19)
      const createdAt = faker.date.between({
        from: order.completedAt!,
        to: new Date(),
      });

      await prisma.review.create({
        data: {
          buyerId: order.buyerId,
          orderId: order.id,
          providerId: order.providerId,
          gigId: order.gigId,
          rating,
          content,
          createdAt,
        },
      });

      totalReviews++;
    }
  }

  console.log(`✅ Seeded ${totalReviews} reviews`);
}

// Update aggregate ratings — Recalculate provider and gig ratings
async function updateAggregates() {
  console.log('📊 Updating aggregate ratings...');

  // Update provider aggregates
  const providers = await prisma.user.findMany({
    where: { isProvider: true, email: { endsWith: '@herafi-seed.test' } },
    include: { reviewsReceived: { select: { rating: true } } },
  });

  for (const provider of providers) {
    const reviews = provider.reviewsReceived;
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    await prisma.user.update({
      where: { id: provider.id },
      data: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
      },
    });
  }

  // Update gig aggregates
  const gigs = await prisma.gig.findMany({
    include: { reviews: { select: { rating: true } } },
  });

  for (const gig of gigs) {
    const reviews = gig.reviews;
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    await prisma.gig.update({
      where: { id: gig.id },
      data: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
      },
    });
  }

  console.log(
    `✅ Updated aggregates for ${providers.length} providers and ${gigs.length} gigs`
  );
}

// Main function with proper disconnect (Pattern 5 from research)
async function main() {
  console.log('🌱 Starting Herafi database seed...');
  console.log(`📌 Using deterministic seed: ${SEED_VALUE}`);

  await cleanup();
  await seedUsers();
  await seedGigs();
  await seedOrders();
  await seedReviews();
  await updateAggregates();

  console.log('🎉 Seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
