import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';  
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ArtistModule } from './artist/artist.module';
import { SongsModule } from './songs/songs.module';
import { UserModule } from './user/user.module';

import * as path from 'path';

@Module({
  imports: [
     ConfigModule.forRoot({
      isGlobal:    true,
      envFilePath: path.join(process.cwd(), '.env'), 
    }),
    DatabaseModule,
    AuthModule,
    ArtistModule,
    SongsModule,
    UserModule,  
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}