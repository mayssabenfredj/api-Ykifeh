import { IsArray, IsOptional, IsString } from 'class-validator';

export class FilterByTypeDto {
  @IsArray()
  @IsString({ each: true })
  types: string[]; 
}
