import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Res,
  UseGuards, UseInterceptors,
  ParseUUIDPipe, DefaultValuePipe, ParseIntPipe,
  HttpCode, HttpStatus, UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ArtistService } from './artist.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';

@Controller('artist')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) { }

  @Post()
  @Roles('artist_manager')
  create(@Body() createArtistDto: CreateArtistDto) {
    return this.artistService.create(createArtistDto);
  }

  @Get()
  @Roles('super_admin', 'artist_manager')
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.artistService.findAll(page, limit);
  }

  @Get(':id')
  @Roles('super_admin', 'artist_manager')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.artistService.findOne(id);
  }

  @Patch(':id')
  @Roles('artist_manager')

  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateArtistDto: UpdateArtistDto) {
    return this.artistService.update(id, updateArtistDto);
  }

  @Delete(':id')
  @Roles('artist_manager')

  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.artistService.remove(id);
  }

  @Post('import-csv')
  @Roles('artist_manager')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (_, file, cb) => {
      if (!file.originalname.match(/\.csv$/)) {
        return cb(new Error('Only CSV files are allowed'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },  // 5MB max
  }))
  importCsv(@UploadedFile() file: Express.Multer.File) {
    return this.artistService.importCsv(file.buffer);
  }
  // @Get('export-csv')
  // @Roles('artist_manager')
  // async exportCsv(@Res() res: Response) {
  //   const csv = await this.artistService.exportCsv();

  //   res.setHeader('Content-Type', 'text/csv');
  //   res.setHeader(
  //     'Content-Disposition',
  //     `attachment; filename="artists_${Date.now()}.csv"`,
  //   );
  //   res.send(csv);
  // }
}
