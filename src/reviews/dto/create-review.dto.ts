import { IsNotEmpty, IsString, Max, Min, IsNumber } from 'class-validator';

export class CreateReviewDto {
 

  @IsNotEmpty()
  @IsString()
  placeId: string;

  @IsString()
  comment: string;


  @IsNumber()
  @Min(1)
  @Max(5) 
  rating: number;
}
