import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Res,
  UseGuards, UseInterceptors,
  ParseUUIDPipe, DefaultValuePipe, ParseIntPipe,
  HttpCode, HttpStatus, UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ArtistService } from './artist.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';

@Controller('artist')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ArtistController {
  constructor(private readonly artistService: ArtistService) { }

   @Get('export-csv')
  @Roles('super_admin', 'artist_manager')
  async exportCsv(@Res() res: Response) {
    const csv = await this.artistService.exportCsv();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="artists_${Date.now()}.csv"`,
    );
    res.send(csv);
  }

@Post('import-csv')
  @Roles('super_admin', 'artist_manager')
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
  },
})
@UseInterceptors(FileInterceptor('file', {
  fileFilter: (_, file, cb) => {
    if (!file.originalname.match(/\.csv$/)) {
      return cb(new Error('Only CSV files are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
}))
importCsv(@UploadedFile() file: Express.Multer.File) {
  return this.artistService.importCsv(file.buffer);
}


  @Post()
  @Roles('super_admin','artist_manager')
  create(@Body() createArtistDto: CreateArtistDto) {
    return this.artistService.create(createArtistDto);
  }

  @Get()
  @Roles('super_admin', 'artist_manager','artist')
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.artistService.findAll(page, limit);
  }

  @Get(':id')
  @Roles('super_admin', 'artist_manager','artist')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.artistService.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin','artist_manager')

  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateArtistDto: UpdateArtistDto) {
    return this.artistService.update(id, updateArtistDto);
  }

  @Delete(':id')
  @Roles('super_admin','artist_manager')

  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.artistService.remove(id);
  }


 
}
