import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

const adapter = new PrismaPg({
  connectionString: "postgres://postgres:postgrespassword@localhost:5432/postgres?sslmode=disable",
});

const prisma = new PrismaClient({ adapter });


async function main() {
  try {

    const user = {
        name: "Anurag",
        email: "anuragpolamarasetty@gmail.com",
        password: "Admin123"
    }

    user.password = await bcrypt.hash(user.password, SALT_ROUNDS);

    console.log(`Adding User ${user.email}`);

    await prisma.users.create({
        data: user
    })

    console.log('✅ Seeding Completed Successfully');
  } catch (error) {
    console.error('❌ Error Seeding Data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();