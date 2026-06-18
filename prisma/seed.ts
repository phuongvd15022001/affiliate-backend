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
  const hashedPassword = await hashPassword('123456');

  await prisma.$transaction(async (tx) => {
    // 1 admin
    await tx.user.upsert({
      where: { email: 'admin@gmail.com' },
      update: { name: 'Admin', password: hashedPassword, role: Role.ADMIN },
      create: {
        email: 'admin@gmail.com',
        name: 'Admin',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });

    // 2 regular users
    const users = [
      { email: 'jon@gmail.com', name: 'John Doe' },
      { email: 'jane@gmail.com', name: 'Jane Smith' },
    ];

    for (const userData of users) {
      await tx.user.upsert({
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
    }
  });

  console.log('Seed completed: 1 admin, 2 users');
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
