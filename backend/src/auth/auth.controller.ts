import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from './auth.types';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { GoogleCredentialDto, RequestOtpDto, VerifyOtpDto } from './dto/auth.dto';
import { LoginCsrfGuard } from './guards/login-csrf.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Get('csrf')
  loginCsrf(@Res({ passthrough: true }) response: Response) {
    return { token: this.auth.issueLoginCsrf(response) };
  }

  @Public()
  @UseGuards(LoginCsrfGuard)
  @Post('otp/request')
  requestOtp(@Body() body: RequestOtpDto, @Req() request: Request) {
    return this.auth.requestOtp(body.email, body.purpose, body.turnstileToken, request);
  }

  @Public()
  @UseGuards(LoginCsrfGuard)
  @Post('otp/verify')
  verifyOtp(
    @Body() body: VerifyOtpDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.auth.verifyOtp(body.requestId, body.requestToken, body.code, request, response);
  }

  @Public()
  @UseGuards(LoginCsrfGuard)
  @Post('google')
  google(
    @Body() body: GoogleCredentialDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.auth.googleLogin(
      body.credential,
      body.purpose,
      body.turnstileToken,
      request,
      response,
    );
  }

  @Get('session')
  session(@CurrentUser() user: AuthenticatedRequest['user']) {
    return this.auth.session(user.id);
  }

  @Post('logout')
  logout(@Req() request: AuthenticatedRequest, @Res({ passthrough: true }) response: Response) {
    return this.auth.logout(request.authSession.id, response);
  }

  @Post('logout-all')
  logoutEverywhere(
    @CurrentUser() user: AuthenticatedRequest['user'],
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.auth.logoutEverywhere(user.id, response);
  }
}
