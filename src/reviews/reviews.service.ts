import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './schema/review.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CustomRequest } from 'src/shared/custom-request';
import { User } from 'src/auth/schema/user.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name)
    private reviewModel: Model<Review>,
    
  ){}
  async create(createReviewDto: CreateReviewDto, request: CustomRequest) {
    const user = request.user as User;
     const favoryCreated = await this.reviewModel.create({
       ...createReviewDto,
       userId : user.id
     });
     if (!favoryCreated) {
       throw new BadRequestException('Review Not Added ');
     }
     return { message: 'Review Added Successfuly ' };
  }

  async findAll(placeId: string) {
    console.log(placeId);
    const reviews = await this.reviewModel.find({ placeId });
    if (!reviews) {
      throw new NotFoundException('No Reviews Found');
    }
    return reviews;
  }

  
 async update(id: string, updateReviewDto: UpdateReviewDto) {
  const updatedReviw = await this.reviewModel
    .findByIdAndUpdate(id, { $set: updateReviewDto }, { new: true })
    .exec();

  if (!updatedReviw) {
    throw new NotFoundException(`Review Not updated`);
  }

  return updatedReviw;
  }

  async remove(id: string, request: CustomRequest) {
   const user = request.user as User;
    const review = await this.reviewModel.findById({ _id : id });
    if (review.userId !== user.id) {
      throw new BadRequestException('You are not allowed to delete this review');
    }
   const reviewDeleted = await this.reviewModel.deleteOne({ _id : id });
    if (!reviewDeleted) {
      throw new BadRequestException('Review Not Deleted');
    }
    return { message: 'Review Deleted' };
  }
}
