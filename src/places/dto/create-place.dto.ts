import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { Types } from 'mongoose';

// DTO pour les jours de travail
class WorkDaysDto {
  @IsNotEmpty()
  @IsString()
  for: string;

  @IsNotEmpty()
  @IsString()
  to: string;
}

// DTO pour les heures de travail
class WorkHoursDto {
  @IsNotEmpty()
  @IsString()
  start: string;

  @IsNotEmpty()
  @IsString()
  end: string;
}

export class CreatePlaceDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  tags: string[];

  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  // daysOfWork utilise WorkDaysDto
  @IsNotEmpty()
  daysOfWork: WorkDaysDto;

  @IsOptional()
  restDays?: string[];

  // hoursOfWork utilise WorkHoursDto
  @IsNotEmpty()
  hoursOfWork: WorkHoursDto;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsString()
  lienMap: string;

  @IsNotEmpty()
  userId: Types.ObjectId;
}
