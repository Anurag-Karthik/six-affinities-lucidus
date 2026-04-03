import { Injectable } from '@nestjs/common';
import { PrismaClient as PostgresClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class DbService
  extends PostgresClient
{
  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    super({ adapter });
  }
}
