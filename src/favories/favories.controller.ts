import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Headers, Req } from '@nestjs/common';
import { FavoriesService } from './favories.service';
import { CreateFavoryDto } from './dto/create-favory.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request } from 'express';

@Controller('favories')
export class FavoriesController {
  constructor(private readonly favoriesService: FavoriesService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Headers('authorization') authorization: string,
    @Body() createFavoryDto: CreateFavoryDto,
    @Req() request: Request,
  ) {
    return this.favoriesService.create(createFavoryDto, request);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(
    @Headers('authorization') authorization: string,
    @Req() request: Request,
  ) {
    return this.favoriesService.findAll(request);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
  ) {
    return this.favoriesService.remove(id);
  }
}
