import { IsEmail, IsEnum, IsString, Length } from 'class-validator';
import { OtpPurpose } from '@prisma/client';

export class RequestOtpDto {
  @IsEmail()
  email!: string;

  @IsEnum(OtpPurpose)
  purpose!: OtpPurpose;
}

export class VerifyOtpDto {
  @IsString()
  @Length(20, 80)
  challengeId!: string;

  @IsString()
  @Length(6, 6)
  code!: string;
}

export class GoogleCredentialDto {
  @IsString()
  @Length(100, 10000)
  credential!: string;
}
