import { IsNotEmpty, IsString } from 'class-validator';

export class SearchPlaceDto {
  @IsString()
  @IsNotEmpty()
  keyword?: string;
}
