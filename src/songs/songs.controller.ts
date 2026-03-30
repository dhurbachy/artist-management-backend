import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { CurrentUser } from '../shared/decorators/current-user.decorator';

// @Controller('songs')
@Controller('artists/:artistId/songs')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Post()
  @Roles('artist', 'super_admin')
  create(
    @Param('artistId', ParseUUIDPipe) artistId: string,
    @Body() dto: CreateSongDto,
    @CurrentUser() currentUser: { id: string; role: string },
  ) {
    return this.songsService.create(artistId, dto, currentUser);
  }

  @Get()
  @Roles('super_admin', 'artist_manager', 'artist')
  findAll(
    @Param('artistId', ParseUUIDPipe) artistId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.songsService.findAll(artistId, page, limit);
  }

  @Get(':songId')
  @Roles('super_admin', 'artist_manager', 'artist')
  findOne(
    @Param('artistId', ParseUUIDPipe) artistId: string,
    @Param('songId', ParseUUIDPipe) songId: string,
  ) {
    return this.songsService.findOne(artistId, songId);
  }

  @Patch(':songId')
  @Roles('artist', 'super_admin')
  update(
    @Param('artistId', ParseUUIDPipe) artistId: string,
    @Param('songId', ParseUUIDPipe) songId: string,
    @Body() dto: UpdateSongDto,
    @CurrentUser() currentUser: { id: string; role: string },
  ) {
    return this.songsService.update(artistId, songId, dto, currentUser);
  }

  @Delete(':songId')
  @Roles('artist', 'super_admin')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('artistId', ParseUUIDPipe) artistId: string,
    @Param('songId', ParseUUIDPipe) songId: string,
    @CurrentUser() currentUser: { id: string; role: string },
  ) {
    return this.songsService.remove(artistId, songId, currentUser);
  }
}
