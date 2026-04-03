import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: "postgres://postgres:postgrespassword@localhost:5432/postgres?sslmode=disable",
});

const prisma = new PrismaClient({ adapter });


async function main() {
  try {

    const user = {
        name: "Anurag",
        email: "anuragpolamarasetty@gmail.com"
    }

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