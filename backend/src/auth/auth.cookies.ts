import { ConfigService } from '@nestjs/config';
import { CookieOptions } from 'express';

export function authCookieNames(config: ConfigService) {
  const secure = config.get<string>('AUTH_COOKIE_SECURE') === 'true';
  const prefix = secure ? '__Host-' : '';
  return {
    session: `${prefix}toonswap_session`,
    csrf: `${prefix}toonswap_csrf`,
    loginCsrf: `${prefix}toonswap_login_csrf`,
  };
}

export function authCookieOptions(config: ConfigService, httpOnly: boolean): CookieOptions {
  const secure = config.get<string>('AUTH_COOKIE_SECURE') === 'true';
  const configured = config.get<string>('AUTH_COOKIE_SAME_SITE', 'lax').toLowerCase();
  const sameSite = ['strict', 'lax', 'none'].includes(configured)
    ? (configured as 'strict' | 'lax' | 'none')
    : 'lax';
  if (sameSite === 'none' && !secure)
    throw new Error('AUTH_COOKIE_SECURE=true is required with SameSite=None');
  return { httpOnly, secure, sameSite, path: '/' };
}
