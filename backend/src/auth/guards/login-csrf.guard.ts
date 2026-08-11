import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { Request } from 'express';
import { authCookieNames } from '../auth.cookies';

@Injectable()
export class LoginCsrfGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const cookie = request.cookies?.[authCookieNames(this.config).loginCsrf];
    const header = request.headers['x-toonswap-login-csrf'];
    if (!cookie || typeof header !== 'string' || !this.equal(cookie, header))
      throw new UnauthorizedException('refresh the sign-in page and try again');
    return true;
  }

  private equal(left: string, right: string) {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
  }
}
