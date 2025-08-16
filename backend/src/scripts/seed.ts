import { MongoClient } from 'mongodb';
import * as argon2 from 'argon2';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/7erfa';

const categories = [
  {
    slug: 'electrician',
    name: { en: 'Electrician', ar: 'كهربائي' },
    icon: 'zap',
  },
  {
    slug: 'plumber',
    name: { en: 'Plumber', ar: 'سباك' },
    icon: 'droplet',
  },
  {
    slug: 'carpenter',
    name: { en: 'Carpenter', ar: 'نجار' },
    icon: 'tool',
  },
  {
    slug: 'painter',
    name: { en: 'Painter', ar: 'دهان' },
    icon: 'brush',
  },
  {
    slug: 'appliance-repair',
    name: { en: 'Appliance Repair', ar: 'تصليح أجهزة' },
    icon: 'settings',
  },
  {
    slug: 'ac-technician',
    name: { en: 'AC Technician', ar: 'فني تكييف' },
    icon: 'wind',
  },
  {
    slug: 'locksmith',
    name: { en: 'Locksmith', ar: 'حداد' },
    icon: 'key',
  },
  {
    slug: 'moving',
    name: { en: 'Moving Service', ar: 'خدمة نقل' },
    icon: 'truck',
  },
];

async function createTestUsers() {
  return [
    {
      email: 'customer@test.com',
      passwordHash: await argon2.hash('password123'),
      firstName: 'Test',
      lastName: 'Customer',
      role: 'customer',
      language: 'en',
      notificationPrefs: { email: true, sms: false, push: true },
    },
    {
      email: 'craftsman@test.com',
      passwordHash: await argon2.hash('password123'),
      firstName: 'Test',
      lastName: 'Craftsman',
      role: 'craftsman',
      language: 'en',
      notificationPrefs: { email: true, sms: false, push: true },
    },
    {
      email: 'admin@test.com',
      passwordHash: await argon2.hash('password123'),
      firstName: 'Test',
      lastName: 'Admin',
      role: 'admin',
      language: 'en',
      notificationPrefs: { email: true, sms: false, push: true },
    },
  ];
}

async function seed() {
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();

  // Clear existing data
  await db.collection('categories').deleteMany({});
  await db.collection('users').deleteMany({});
  await db.collection('craftsmen').deleteMany({});
  await db.collection('wallets').deleteMany({});

  // Insert categories
  const categoriesResult = await db.collection('categories').insertMany(categories);
  console.log(`Inserted ${categoriesResult.insertedCount} categories`);

  // Insert users
  const testUsers = await createTestUsers();
  const usersResult = await db.collection('users').insertMany(testUsers);
  console.log(`Inserted ${usersResult.insertedCount} users`);

  // Create craftsman profile
  const craftsmanUser = await db.collection('users').findOne({ role: 'craftsman' });
  const electricianCategory = await db.collection('categories').findOne({ slug: 'electrician' });

  if (craftsmanUser && electricianCategory) {
    const craftsman = {
      userId: craftsmanUser._id,
      crafts: [{ categoryId: electricianCategory._id, title: 'General Electrician' }],
      serviceAreas: [
        { city: 'Cairo', area: 'Maadi', radiusKm: 10 },
      ],
      hourlyRate: 100,
      baseCalloutFee: 50,
      bio: 'Experienced electrician with 10+ years of experience',
      yearsExperience: 10,
      portfolio: [],
      rating: { avg: 0, count: 0 },
      availabilityRules: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
      ],
      availabilityExceptions: [],
      kyc: { status: 'approved', docs: [] },
      stats: { jobsCompleted: 0, onTimeRate: 100 },
    };

    await db.collection('craftsmen').insertOne(craftsman);
    console.log('Created craftsman profile');

    // Create wallets
    const wallets = [
      {
        ownerType: 'user',
        ownerId: craftsmanUser._id,
        balanceCents: 0,
        currency: 'EGP',
      },
      {
        ownerType: 'user',
        ownerId: usersResult.insertedIds[0],
        balanceCents: 0,
        currency: 'EGP',
      },
    ];

    await db.collection('wallets').insertMany(wallets);
    console.log(`Created ${wallets.length} wallets`);
  }

  await client.close();
  console.log('Database seeded successfully');
}

seed().catch(console.error);