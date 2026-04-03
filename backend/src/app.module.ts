import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbService } from './db/db.service';
import { DbModule } from './db/db.module';
import { UsersModule } from './users/users.module';
import { AssessmentsModule } from './assessments/assessments.module';

@Module({
  imports: [DbModule, UsersModule, AssessmentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
