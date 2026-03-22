import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';  
import { ConfigModule } from '@nestjs/config';

import * as path from 'path';

@Module({
  imports: [
     ConfigModule.forRoot({
      isGlobal:    true,
      envFilePath: path.join(process.cwd(), '.env'), 
    }),
    DatabaseModule,  
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}