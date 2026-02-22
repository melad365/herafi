import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { faker } from '@faker-js/faker';
import 'dotenv/config';

// Initialize PrismaClient with pg adapter (same pattern as src/lib/db.ts)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Deterministic seed for reproducibility (SEED-06)
const SEED_VALUE = 42;
faker.seed(SEED_VALUE);

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

// Seed users — placeholder for Phase 11 (SEED-04: upsert pattern)
async function seedUsers() {
  console.log('👤 Seeding users...');

  // Phase 11 will populate this with 10-15 providers
  // Using upsert pattern for idempotency:
  // await prisma.user.upsert({
  //   where: { email: 'provider1@herafi-seed.test' },
  //   update: {},
  //   create: { ... },
  // });

  console.log('✅ Users seeded');
}

// Seed gigs — placeholder for Phase 11
async function seedGigs() {
  console.log('🛠️ Seeding gigs...');
  // Phase 11 will create 1-3 gigs per provider
  console.log('✅ Gigs seeded');
}

// Seed orders — placeholder for Phase 11
async function seedOrders() {
  console.log('📦 Seeding orders...');
  // Phase 11 will create completed orders as review foundation
  console.log('✅ Orders seeded');
}

// Seed reviews — placeholder for Phase 11
async function seedReviews() {
  console.log('⭐ Seeding reviews...');
  // Phase 11 will create 3-8 reviews per provider
  console.log('✅ Reviews seeded');
}

// Update aggregate ratings — placeholder for Phase 11
async function updateAggregates() {
  console.log('📊 Updating aggregate ratings...');
  // Phase 11 will recalculate averageRating and totalReviews
  console.log('✅ Aggregates updated');
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
