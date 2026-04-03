import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DbService } from '../db/db.service';

@Module({
  providers: [UsersService, DbService],
  exports: [UsersService]
})
export class UsersModule {}
