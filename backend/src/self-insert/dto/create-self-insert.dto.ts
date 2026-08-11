import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export enum SelfInsertVoiceModeInput {
  AS_IS = 'AS_IS',
  CONVERT = 'CONVERT',
}
const multipartBoolean = ({ value }: { value: unknown }) => value === true || value === 'true';

export class CreateSelfInsertDto {
  @IsOptional() @IsUUID() projectId?: string;
  @IsString() @MaxLength(80) displayName!: string;
  @IsEnum(SelfInsertVoiceModeInput) voiceMode: SelfInsertVoiceModeInput =
    SelfInsertVoiceModeInput.AS_IS;
  @ValidateIf((input) => input.voiceMode === SelfInsertVoiceModeInput.CONVERT)
  @IsString()
  @MaxLength(80)
  voiceStyle?: string;
  @IsOptional() @IsString() @MaxLength(12000) scriptText?: string;
  @Transform(multipartBoolean) @IsBoolean() likenessAuthorized!: boolean;
  @Transform(multipartBoolean) @IsBoolean() voiceAuthorized!: boolean;
  @Transform(multipartBoolean) @IsBoolean() retentionAccepted!: boolean;
}
