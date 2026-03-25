import { Module } from '@nestjs/common';
import { SongsService } from './songs.service';
import { SongsController } from './songs.controller';
import { ArtistModule } from 'src/artist/artist.module';
import { SongsRepository } from './songs.repository';

@Module({
  imports:[ArtistModule],
  controllers: [SongsController],
  providers: [SongsService,SongsRepository],
  exports:[SongsService]
})
export class SongsModule {}
