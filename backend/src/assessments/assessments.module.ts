import { Module } from '@nestjs/common';
import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';
import { UsersModule } from '../users/users.module';
import { DbService } from '../db/db.service';
import { UsersService } from '../users/users.service';

@Module({
  controllers: [AssessmentsController],
  providers: [AssessmentsService, DbService, UsersService]
})
export class AssessmentsModule {}
