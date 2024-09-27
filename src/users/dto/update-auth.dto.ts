import { IsString, IsOptional, IsObject } from 'class-validator';


export class UpdateAuthDto {
  

  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsObject()
  address: object;
}
