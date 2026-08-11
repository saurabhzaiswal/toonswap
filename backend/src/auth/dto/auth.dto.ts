import { IsEmail, IsEnum, IsString, IsUUID, Length, MaxLength } from 'class-validator';
import { OtpPurpose } from '@prisma/client';

export class RequestOtpDto {
  @IsEmail()
  email!: string;

  @IsEnum(OtpPurpose)
  purpose!: OtpPurpose;

  @IsString()
  @MaxLength(2048)
  turnstileToken!: string;
}

export class VerifyOtpDto {
  @IsUUID()
  requestId!: string;

  @IsString()
  @Length(20, 120)
  requestToken!: string;

  @IsString()
  @Length(6, 6)
  code!: string;
}

export class GoogleCredentialDto {
  @IsString()
  @Length(100, 10000)
  credential!: string;

  @IsEnum(OtpPurpose)
  purpose!: OtpPurpose;

  @IsString()
  @MaxLength(2048)
  turnstileToken!: string;
}
