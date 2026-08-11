import { Body, Controller, Delete, Get, Post, Put, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AvatarUploadDto, DeleteAccountDto, UpdateProfileDto } from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('api/users/me')
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly auth: AuthService,
  ) {}

  @Get()
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.users.me(user.id);
  }

  @Put()
  update(@CurrentUser() user: AuthenticatedUser, @Body() body: UpdateProfileDto) {
    return this.users.updateProfile(user.id, body);
  }

  @Post('avatar/upload-session')
  avatarUpload(@CurrentUser() user: AuthenticatedUser, @Body() body: AvatarUploadDto) {
    return this.users.createAvatarUpload(user.id, body);
  }

  @Post('avatar/finalize')
  finalizeAvatar(@CurrentUser() user: AuthenticatedUser) {
    return this.users.finalizeAvatar(user.id);
  }

  @Get('avatar')
  async avatar(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const avatar = await this.users.avatar(user.id);
    response.setHeader('Content-Type', avatar.contentType);
    response.setHeader('Cache-Control', 'private, no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    if (avatar.length) response.setHeader('Content-Length', String(avatar.length));
    return new StreamableFile(avatar.body);
  }

  @Delete()
  async deleteAccount(
    @CurrentUser() user: AuthenticatedUser,
    @Body() _body: DeleteAccountDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.users.deleteAccount(user.id);
    this.auth.clearAuthCookies(response);
    return result;
  }
}
