import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateAuthDto {
  @IsOptional()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsObject()
  address: object;
}
