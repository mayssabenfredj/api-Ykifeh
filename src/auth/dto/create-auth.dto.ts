import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  
  IsObject,
} from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsObject()
  address: object;


}