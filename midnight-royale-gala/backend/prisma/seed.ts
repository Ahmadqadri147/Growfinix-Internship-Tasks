import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Use MongoDB native driver to bypass Prisma's replica set requirement
  const mongoUri = process.env.DATABASE_URL || 'mongodb://localhost:27017/midnight-royale-gala';
  const mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
  const db = mongoClient.db();

  // Clean existing data
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    await db.collection(col.name).deleteMany({});
  }
  console.log('Cleaned existing data');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const adminResult = await db.collection('User').insertOne({
    email: 'admin@midnightroyale.com',
    password: adminPassword,
    name: 'Admin Midnight Royale',
    phone: '+1234567890',
    role: 'ADMIN',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const adminId = adminResult.insertedId.toString();

  await db.collection('Admin').insertOne({
    userId: adminId,
    permissions: ['all'],
    createdAt: new Date(),
  });
  console.log('Admin user created: admin@midnightroyale.com');

  // Create regular user
  const userPassword = await bcrypt.hash('User@1234', 12);
  const userResult = await db.collection('User').insertOne({
    email: 'guest@midnightroyale.com',
    password: userPassword,
    name: 'Guest User',
    phone: '+1987654321',
    role: 'USER',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const userId = userResult.insertedId.toString();
  console.log('Regular user created: guest@midnightroyale.com');

  // Create venue
  const venueResult = await db.collection('Venue').insertOne({
    name: 'The Grand Crystal Ballroom',
    address: '123 Luxury Avenue, Suite 100',
    city: 'Beverly Hills',
    capacity: 500,
    description: 'An exquisite ballroom featuring crystal chandeliers, marble floors, and panoramic views of the city skyline. Perfect for high-end galas and exclusive events.',
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3',
    ],
    amenities: [
      'Valet Parking', 'Wine Cellar', 'Stage', 'Professional Lighting',
      'Sound System', 'Catering Kitchen', 'VIP Lounge', 'Security',
    ],
    mapUrl: 'https://maps.google.com/?q=Beverly+Hills',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const venueId = venueResult.insertedId.toString();
  console.log('Venue created: The Grand Crystal Ballroom');

  // Create event
  const eventDate = new Date();
  eventDate.setMonth(eventDate.getMonth() + 2);
  eventDate.setDate(15);

  const eventResult = await db.collection('Event').insertOne({
    title: 'Midnight Royale Gala 2024',
    description: 'Experience an unforgettable evening of luxury, entertainment, and philanthropy at the most anticipated gala of the year. Dress code: Black Tie. Featuring live performances, gourmet dining, and exclusive auctions.',
    date: eventDate,
    time: '19:00',
    venueId: venueId,
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
    gallery: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3',
      'https://images.unsplash.com/photo-1505236858219-8359eb29e329',
    ],
    status: 'PUBLISHED',
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const eventId = eventResult.insertedId.toString();
  console.log('Event created: Midnight Royale Gala 2024');

  // Create ticket types
  const ticketTypesData = [
    {
      eventId,
      name: 'Silver',
      description: 'Standard admission with access to the main hall and welcome drink.',
      price: 200,
      quantity: 200,
      available: 200,
      benefits: ['Main Hall Access', 'Welcome Drink', 'Digital Program'],
      color: '#C0C0C0',
    },
    {
      eventId,
      name: 'Gold',
      description: 'Premium seating with dedicated waiter service and champagne reception.',
      price: 500,
      quantity: 150,
      available: 150,
      benefits: ['Premium Seating', 'Champagne Reception', 'Dedicated Waiter', 'Gift Bag', 'Digital Program'],
      color: '#FFD700',
    },
    {
      eventId,
      name: 'Diamond',
      description: 'VIP experience including private lounge access and gourmet dining.',
      price: 1000,
      quantity: 80,
      available: 80,
      benefits: ['VIP Lounge Access', 'Gourmet Dinner', 'Premium Bar', 'Private Butler', 'Gift Bag', 'Digital Program', 'Parking Pass'],
      color: '#B9F2FF',
    },
    {
      eventId,
      name: 'VIP',
      description: 'The ultimate luxury experience with front-row seats, personal concierge, and exclusive after-party.',
      price: 2500,
      quantity: 30,
      available: 30,
      benefits: [
        'Front Row Seating', 'Personal Concierge', 'Exclusive After-Party',
        'Private Car Service', 'Gourmet Dinner with Wine Pairing', 'VIP Lounge Access',
        'Premium Bar', 'Luxury Gift Bag', 'Digital Program', 'Photography Package',
      ],
      color: '#E5E4E2',
    },
  ];

  const ticketTypeIds: string[] = [];
  for (const ticketData of ticketTypesData) {
    const result = await db.collection('TicketType').insertOne({
      ...ticketData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    ticketTypeIds.push(result.insertedId.toString());
  }
  console.log('Ticket types created');

  // Create seats (200 seats across 10 rows)
  const rows = 10;
  const seatsPerRow = 20;
  const tierMapping = [
    { rowStart: 0, rowEnd: 2, tier: 'VIP', price: 2500 },
    { rowStart: 2, rowEnd: 4, tier: 'DIAMOND', price: 1000 },
    { rowStart: 4, rowEnd: 6, tier: 'GOLD', price: 500 },
    { rowStart: 6, rowEnd: 10, tier: 'SILVER', price: 200 },
  ];

  let seatCount = 0;
  const seatDocs: any[] = [];
  for (let r = 0; r < rows; r++) {
    const rowLabel = String.fromCharCode(65 + r);
    let tier = 'SILVER';
    let price = 200;
    for (const t of tierMapping) {
      if (r >= t.rowStart && r < t.rowEnd) {
        tier = t.tier;
        price = t.price;
        break;
      }
    }
    for (let n = 1; n <= seatsPerRow; n++) {
      seatDocs.push({
        eventId,
        section: 'A',
        row: rowLabel,
        number: n,
        tier,
        price,
        status: 'AVAILABLE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      seatCount++;
    }
  }
  await db.collection('Seat').insertMany(seatDocs);
  console.log(`Created ${seatCount} seats`);

  // Create sample coupons
  await db.collection('Coupon').insertMany([
    {
      code: 'MIDNIGHT20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      maxUses: 100,
      usedCount: 0,
      minAmount: 500,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdAt: new Date(),
    },
    {
      code: 'VIP100',
      discountType: 'FIXED',
      discountValue: 100,
      maxUses: 50,
      usedCount: 0,
      minAmount: 1000,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdAt: new Date(),
    },
  ]);
  console.log('Coupons created');

  await mongoClient.close();
  console.log('\n✅ Database seeded successfully!');
  console.log('Admin login: admin@midnightroyale.com / Admin@123');
  console.log('User login:  guest@midnightroyale.com / User@1234');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
