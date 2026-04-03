import { Injectable } from '@nestjs/common';
import { PrismaClient as PostgresClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DbService
  extends PostgresClient
{
  constructor(configService: ConfigService) {
    const adapter = new PrismaPg({ connectionString: configService.getOrThrow<string>('DATABASE_URL') });
    super({ adapter });
  }
}
