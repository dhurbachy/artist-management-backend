import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { ArtistsRepository } from './artists.repository';
import { Parser } from 'json2csv';
import { Readable } from 'stream';
// import { parse } from 'csv-parser';
import csvParser from 'csv-parser';
@Injectable()
export class ArtistService {
  constructor(private readonly artistsRepo: ArtistsRepository) { }
  async create(createArtistDto: CreateArtistDto) {
    return this.artistsRepo.createArtist(createArtistDto);
  }

  async findAll(page: number, limit: number) {
    return this.artistsRepo.findAllPaginated(page, limit);
  }

  async findOne(id: string) {
    const artist = this.artistsRepo.findArtistById(id);
    if (!artist) throw new NotFoundException(`Artist ${id} Not Found`);
    return artist;

  }

  async update(id: string, updateArtistDto: UpdateArtistDto) {
    await this.findOne(id);
    const updated = await this.artistsRepo.updateArtist(id, updateArtistDto);
    if (!updated) throw new NotFoundException('Update Failed');
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.artistsRepo.deleteArtist(id);
  }

  async exportCsv(): Promise<string> {
    const artists = await this.artistsRepo.findAllForExport();

    if (artists.length === 0) {
      throw new BadRequestException('No artists to export');
    }

    const fields = [
      'id', 'name', 'dob', 'gender',
      'address', 'first_release_year',
      'no_of_albums_released', 'created_at',
    ];

    const parser = new Parser({ fields });
    return parser.parse(artists);
  }


  async importCsv(fileBuffer: Buffer): Promise<{
    imported: number;
    errors: string[];
  }> {
    const artists: any[] = [];
    const errors: string[] = [];

    await new Promise<void>((resolve, reject) => {
      const stream = Readable.from(fileBuffer);
      stream
        .pipe(csvParser({ headers: true, strict: true })) // Use the default import here
        .on('data', (row: any) => {
          if (!row.name) {
            errors.push(`Skipped row — missing name: ${JSON.stringify(row)}`);
            return;
          }
          artists.push({
            name: row.name,
            dob: row.dob || null,
            gender: row.gender || null,
            address: row.address || null,
            first_release_year: row.first_release_year
              ? parseInt(row.first_release_year, 10)
              : null,
            no_of_albums_released: row.no_of_albums_released
              ? parseInt(row.no_of_albums_released, 10)
              : 0,
          });
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    if (artists.length === 0 && errors.length === 0) {
      throw new BadRequestException('No valid rows found in CSV');
    }

    const inserted = await this.artistsRepo.bulkInsert(artists);

    return {
      imported: inserted.length,
      errors,
    };
  }

}

