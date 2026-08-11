import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { JobStatus, UserRole, UserStatus } from '@prisma/client';

export class AdminUserQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(100)
  pageSize = 20;

  @IsOptional()
  @IsIn(['createdAt', 'lastSeenAt', 'name', 'email'])
  sortBy: 'createdAt' | 'lastSeenAt' | 'name' | 'email' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}

export class AdminJobQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(100)
  pageSize = 20;
}

export class AdminActivityQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  action?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(100)
  pageSize = 20;
}

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status!: UserStatus;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}

export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}

export class UpdateUsagePolicyDto {
  @IsBoolean()
  unlimited!: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  generationLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3650)
  windowDays?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}
