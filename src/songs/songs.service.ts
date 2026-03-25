import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SongsRepository } from './songs.repository';
import { ArtistsRepository } from '../artist/artists.repository';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
@Injectable()
export class SongsService {
  constructor(
    private readonly artistRepo: ArtistsRepository,
    private readonly songsRepo: SongsRepository,
  ) { }
  // ─── verify artist exists ─────────────────────────────────────────
  private async checkArtistExists(artistId: string) {
    const artist = await this.artistRepo.findArtistById(artistId);
    if (!artist) throw new NotFoundException(`Artist ${artistId} not found`);
    return artist;
  }

  // ─── verify song belongs to artist ───────────────────────────────
  private async checkSongBelongsToArtist(
    songId: string,
    artistId: string,
  ) {
    const song = await this.songsRepo.findByIdAndArtist(songId, artistId);
    if (!song) throw new NotFoundException(`Song ${songId} not found for this artist`);
    return song;
  }

  async create(artistId: string, createSongDto: CreateSongDto, currentUser: { id: string; role: string },
  ) {

    const artist = await this.checkArtistExists(artistId);
    // artist role → can only add songs to their own profile
    if (currentUser.role === 'artist' && artist.user_id !== currentUser.id) {
      throw new ForbiddenException('You can only add songs to your own profile');
    }
    return this.songsRepo.createSong({
      artist_id: artistId,
      ...createSongDto,
    });
  }

  async findAll(artistId: string, page: number, limit: number) {
    await this.checkArtistExists(artistId);
    return this.songsRepo.findByArtistPaginated(artistId, page, limit);
  }

  async findOne(artistId: string, songId: string) {
    await this.checkArtistExists(artistId);
    return this.checkSongBelongsToArtist(songId, artistId);
  }

  async update(artistId: string,songId:string, updateSongDto: UpdateSongDto,currentUser:{id:string,role:string}) {

    const artist=await this.checkArtistExists(artistId);
    if(currentUser.role==='artist' && artist.user_id!==currentUser.id){
      throw new ForbiddenException('You can only update songs on your profile');

    }
    await this.checkSongBelongsToArtist(songId, artistId);

    const updated = await this.songsRepo.updateSong(songId, artistId, updateSongDto);
    if (!updated) throw new BadRequestException('Update failed');
    return updated;
  }

  async remove(artistId: string,songId:string,currentUser:{id:string,role:string}) {
    const artist =await this.checkArtistExists(artistId);
    if (currentUser.role === 'artist' && artist.user_id !== currentUser.id) {
      throw new ForbiddenException('You can only delete songs on your own profile');
    }
     await this.checkSongBelongsToArtist(songId, artistId);
    return this.songsRepo.deleteSong(songId, artistId);

  }
}
