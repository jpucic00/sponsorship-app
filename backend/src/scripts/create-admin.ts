import bcrypt from 'bcrypt';
import { prisma } from '../lib/db';

async function createAdminUser() {
  const username = process.argv[2] || 'admin';
  const password = process.argv[3] || 'admin123';
  const fullName = process.argv[4] || 'Administrator';

  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { username },
    });

    if (existing) {
      console.log(`❌ User '${username}' already exists`);
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullName,
        role: 'admin',
        isApproved: true, // Auto-approve admin
        isActive: true,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log(`Username: ${user.username}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${user.role}`);
    console.log(`\n⚠️  Please change the password after first login!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
