import { Module } from '@nestjs/common';
import { ArtistService } from './artist.service';
import { ArtistController } from './artist.controller';
import { ArtistsRepository } from './artists.repository';

@Module({
  controllers: [ArtistController],
  providers: [ArtistService, ArtistsRepository],
  exports: [ArtistService, ArtistsRepository],

})
export class ArtistModule { }
