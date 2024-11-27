import { IsNotEmpty, IsString } from "class-validator";

export class CreateFavoryDto {
  
  @IsNotEmpty()
  @IsString()
  placeId: string;
}
