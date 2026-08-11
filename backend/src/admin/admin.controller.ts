import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';
import {
  AdminJobQueryDto,
  AdminUserQueryDto,
  UpdateUsagePolicyDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
} from './dto/admin.dto';

@Roles(UserRole.ADMIN)
@Controller('api/admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('overview')
  overview() {
    return this.admin.overview();
  }

  @Get('users')
  users(@Query() query: AdminUserQueryDto) {
    return this.admin.users(query);
  }

  @Get('jobs')
  jobs(@Query() query: AdminJobQueryDto) {
    return this.admin.jobs(query);
  }

  @Patch('users/:userId/status')
  status(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body() body: UpdateUserStatusDto,
  ) {
    return this.admin.updateStatus(actor.id, userId, body);
  }

  @Patch('users/:userId/role')
  role(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body() body: UpdateUserRoleDto,
  ) {
    return this.admin.updateRole(actor.id, userId, body);
  }

  @Patch('users/:userId/usage-policy')
  usagePolicy(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body() body: UpdateUsagePolicyDto,
  ) {
    return this.admin.updateUsagePolicy(actor.id, userId, body);
  }
}
