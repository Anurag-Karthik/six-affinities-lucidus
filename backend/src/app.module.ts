import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbService } from './db/db.service';
import { DbModule } from './db/db.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [DbModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
