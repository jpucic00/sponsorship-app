import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample schools
  const schools = [
    { name: 'Kampala Primary School', location: 'Kampala' },
    { name: 'Entebbe Community School', location: 'Entebbe' },
    { name: 'Jinja Secondary School', location: 'Jinja' },
    { name: 'Mbale Primary School', location: 'Mbale' },
    { name: 'Gulu High School', location: 'Gulu' },
  ];

  for (const school of schools) {
    await prisma.school.upsert({
      where: { name: school.name },
      update: {},
      create: school,
    });
  }

  // Create sample proxies - Alternative approach without unique constraint
  const proxies = [
    {
      fullName: 'Father Michael Ochieng',
      contact: '+256701234567, St. Mary\'s Church',
      role: 'Priest',
      description: 'Local church leader helping with sponsorships'
    },
    {
      fullName: 'Sister Agnes Namalwa',
      contact: 'agnes@holyspirit.org, +256702345678',
      role: 'Nun',
      description: 'Works with children in rural communities'
    },
    {
      fullName: 'John Mukasa',
      contact: '+256703456789, Community Center Leader',
      role: 'Community Leader',
      description: 'Local community organizer'
    }
  ];

  // Check if proxies already exist, if not create them
  for (const proxy of proxies) {
    const existingProxy = await prisma.proxy.findFirst({
      where: { fullName: proxy.fullName }
    });
    
    if (!existingProxy) {
      await prisma.proxy.create({
        data: proxy
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });