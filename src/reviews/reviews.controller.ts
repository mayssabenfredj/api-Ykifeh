import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Headers, Req } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request } from 'express';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Headers('authorization') authorization: string,
    @Body() createReviewDto: CreateReviewDto,
    @Req() request: Request,
  ) {
    return this.reviewsService.create(createReviewDto, request);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findAll(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
  ) {
    return this.reviewsService.findAll(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    return this.reviewsService.remove(id, request);
  }
}
