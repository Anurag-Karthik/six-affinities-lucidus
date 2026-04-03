import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient as PostgresClient } from '@prisma/client';

@Injectable()
export class DbService extends PostgresClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Prisma Client Connected to DB');
    } catch (error) {
      console.error('Prisma Client Failed to connect to DB:', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      console.log('Prisma Client isconnected from DB');
    } catch (error) {
      console.log('Prisma Client Failed to disconnect from DB', error);
    }
  }
}