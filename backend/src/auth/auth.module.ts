import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TransactionalMailModule } from '../mail/transactional-mail.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { CsrfGuard } from './guards/csrf.guard';
import { LoginCsrfGuard } from './guards/login-csrf.guard';
import { RolesGuard } from './guards/roles.guard';
import { TurnstileService } from './turnstile.service';

@Module({
  imports: [TransactionalMailModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    TurnstileService,
    LoginCsrfGuard,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: CsrfGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
