import { ConfigService } from '@nestjs/config';
import { CookieOptions } from 'express';

function secureCookies(config: ConfigService) {
  const configured = config.get<string>('AUTH_COOKIE_SECURE')?.trim().toLowerCase();
  if (!configured) return config.get<string>('NODE_ENV') === 'production';
  if (['1', 'true', 'yes', 'on'].includes(configured)) return true;
  if (['0', 'false', 'no', 'off'].includes(configured)) return false;
  return config.get<string>('NODE_ENV') === 'production';
}

export function authCookieNames(config: ConfigService) {
  const secure = secureCookies(config);
  const prefix = secure ? '__Host-' : '';
  return {
    session: `${prefix}toonswap_session`,
    csrf: `${prefix}toonswap_csrf`,
    loginCsrf: `${prefix}toonswap_login_csrf`,
  };
}

export function authCookieOptions(config: ConfigService, httpOnly: boolean): CookieOptions {
  const secure = secureCookies(config);
  const configured = config.get<string>('AUTH_COOKIE_SAME_SITE', 'lax').toLowerCase();
  const sameSite = ['strict', 'lax', 'none'].includes(configured)
    ? (configured as 'strict' | 'lax' | 'none')
    : 'lax';
  if (sameSite === 'none' && !secure)
    throw new Error('AUTH_COOKIE_SECURE=true is required with SameSite=None');
  return { httpOnly, secure, sameSite, path: '/' };
}
