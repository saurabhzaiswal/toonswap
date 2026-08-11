import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { createHash, timingSafeEqual } from 'crypto';
import { authCookieNames } from '../auth.cookies';
import { AuthenticatedRequest } from '../auth.types';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext) {
    if (
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ])
    )
      return true;
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return true;
    const cookie = request.cookies?.[authCookieNames(this.config).csrf];
    const header = request.headers['x-toonswap-csrf'];
    if (!cookie || typeof header !== 'string' || !this.equal(cookie, header))
      throw new ForbiddenException('invalid CSRF token');
    const hash = createHash('sha256').update(header).digest('hex');
    if (!this.equal(hash, request.authSession.csrfTokenHash))
      throw new ForbiddenException('invalid CSRF token');
    return true;
  }

  private equal(left: string, right: string) {
    const a = Buffer.from(left);
    const b = Buffer.from(right);
    return a.length === b.length && timingSafeEqual(a, b);
  }
}
