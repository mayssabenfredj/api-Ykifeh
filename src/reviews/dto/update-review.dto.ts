import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator";


export class UpdateReviewDto {
    
  @IsOptional()
  @IsString()
  comment: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}
