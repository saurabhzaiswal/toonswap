import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Max,
  Min,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @Length(2, 120)
  name!: string;

  @IsDateString({ strict: true })
  dateOfBirth!: string;

  @IsString()
  @Length(1, 120)
  city!: string;

  @IsString()
  @Length(2, 2)
  countryCode!: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  locale?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @IsBoolean()
  acceptTerms!: boolean;

  @IsBoolean()
  acceptPrivacy!: boolean;
}

export class AvatarUploadDto {
  @IsString()
  @MaxLength(180)
  fileName!: string;

  @IsString()
  @IsIn(['image/jpeg', 'image/png', 'image/webp'])
  contentType!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5 * 1024 * 1024)
  fileSize!: number;
}

export class DeleteAccountDto {
  @IsString()
  @IsIn(['DELETE'])
  confirmation!: string;
}
