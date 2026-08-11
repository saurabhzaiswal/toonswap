import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class StorySceneDto {
  @IsOptional() @IsString() @MaxLength(120) title?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(900) duration?: number;
  @IsOptional() @IsString() @MaxLength(300) character?: string;
  @IsOptional() @IsString() @MaxLength(200) location?: string;
  @IsOptional() @IsString() @MaxLength(4000) action?: string;
  @IsOptional() @IsString() @MaxLength(6000) dialogue?: string;
  @IsOptional() @IsString() @MaxLength(80) expression?: string;
  @IsOptional() @IsString() @MaxLength(120) camera?: string;
  @IsOptional() @IsString() @MaxLength(80) audioMode?: string;
  @IsOptional() @IsString() @MaxLength(80) changeScope?: string;
  @IsOptional() @IsString() @MaxLength(2000) continuity?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(150) voiceVolume?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(-4) @Max(4) voicePitch?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0.75) @Max(1.25) voiceSpeed?: number;
  @IsOptional() @IsString() @MaxLength(120) musicTrack?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100) musicVolume?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(899) trimStart?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(899) trimEnd?: number;
  @IsOptional() @IsString() @MaxLength(80) transition?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(1000) audioRevision?: number;
}

export class StoryCastMemberDto {
  @IsOptional() @IsString() id?: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsString() voiceProfileId?: string;
  @IsOptional() @IsString() selfInsertAssetId?: string;
  @IsOptional() @IsObject() customSnapshot?: Record<string, unknown>;
}

export class CreateStoryProjectDto {
  @IsOptional() @IsString() @MaxLength(160) title?: string;
  @IsString() @MinLength(12) @MaxLength(12000) prompt!: string;
  @IsOptional() @IsString() era?: string;
  @IsOptional() @IsString() genre?: string;
  @IsOptional() @IsString() audience?: string;
  @IsOptional() @IsString() visualStyle?: string;
  @IsOptional() @IsString() language?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(15) @Max(3600) duration?: number;
  @IsOptional() @IsBoolean() captions?: boolean;
  @IsOptional() @IsString() mode?: string;
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => StoryCastMemberDto)
  cast?: StoryCastMemberDto[];
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(120)
  @ValidateNested({ each: true })
  @Type(() => StorySceneDto)
  scenes?: StorySceneDto[];
}

export class UpdateStorySceneDto extends StorySceneDto {}
