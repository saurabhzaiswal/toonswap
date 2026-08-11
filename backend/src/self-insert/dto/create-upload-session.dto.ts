import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsMimeType,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { SelfInsertVoiceModeInput } from './create-self-insert.dto';

export class CreateUploadSessionDto {
  @IsOptional() @IsUUID() projectId?: string;
  @IsString() @MaxLength(80) displayName!: string;
  @IsEnum(SelfInsertVoiceModeInput) voiceMode: SelfInsertVoiceModeInput =
    SelfInsertVoiceModeInput.AS_IS;
  @ValidateIf((input) => input.voiceMode === SelfInsertVoiceModeInput.CONVERT)
  @IsString()
  @MaxLength(80)
  voiceStyle?: string;
  @IsOptional() @IsString() @MaxLength(12000) scriptText?: string;
  @IsBoolean() likenessAuthorized!: boolean;
  @IsBoolean() voiceAuthorized!: boolean;
  @IsBoolean() retentionAccepted!: boolean;
  @IsOptional() @IsString() @MaxLength(180) photoName?: string;
  @IsOptional() @IsMimeType() photoType?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10 * 1024 * 1024) photoSize?: number;
  @IsOptional() @IsString() @MaxLength(180) voiceName?: string;
  @IsOptional() @IsMimeType() voiceType?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(15 * 1024 * 1024) voiceSize?: number;
}
