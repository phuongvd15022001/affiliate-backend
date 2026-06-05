import { randomBytes, scrypt } from 'crypto';
import { PrismaClient, Role } from '@prisma/client';

const hashPassword = (password: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const salt = randomBytes(8).toString('hex');
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await hashPassword('password123');

  await prisma.$transaction(async (tx) => {
    // 1 admin
    await tx.user.upsert({
      where: { email: 'admin@example.com' },
      update: { name: 'Admin', password: hashedPassword, role: Role.ADMIN },
      create: {
        email: 'admin@example.com',
        name: 'Admin',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });

    // 2 regular users, each with 5 products
    const users = [
      {
        email: 'john@example.com',
        name: 'John Doe',
        products: [
          {
            name: 'iPhone 15 Pro',
            description: 'Apple flagship smartphone',
            price: 999.99,
          },
          {
            name: 'AirPods Pro',
            description: 'Noise-cancelling wireless earbuds',
            price: 249.99,
          },
          { name: 'iPad Air', description: '10.9-inch tablet', price: 599.99 },
          {
            name: 'Apple Watch Series 9',
            description: 'Smartwatch with health tracking',
            price: 399.99,
          },
          {
            name: 'MacBook Air M2',
            description: '13-inch ultra-thin laptop',
            price: 1099.99,
          },
        ],
      },
      {
        email: 'jane@example.com',
        name: 'Jane Smith',
        products: [
          {
            name: 'Samsung Galaxy S24',
            description: 'Android flagship smartphone',
            price: 899.99,
          },
          {
            name: 'Sony WH-1000XM5',
            description: 'Premium noise-cancelling headphones',
            price: 349.99,
          },
          {
            name: 'Dell XPS 15',
            description: '15-inch high-performance laptop',
            price: 1499.99,
          },
          {
            name: 'Logitech MX Master 3',
            description: 'Advanced wireless mouse',
            price: 99.99,
          },
          {
            name: 'LG 27" 4K Monitor',
            description: 'Ultra HD IPS display',
            price: 449.99,
          },
        ],
      },
    ];

    for (const userData of users) {
      const user = await tx.user.upsert({
        where: { email: userData.email },
        update: {
          name: userData.name,
          password: hashedPassword,
          role: Role.USER,
        },
        create: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          role: Role.USER,
        },
      });

      const existingCount = await tx.product.count({ where: { userId: user.id } });
      if (existingCount === 0) {
        await tx.product.createMany({
          data: userData.products.map((p) => ({ ...p, userId: user.id })),
        });
      }
    }
  });

  console.log('Seed completed: 1 admin, 2 users, 10 products (5 per user)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
