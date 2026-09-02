import {
  Controller,
  Post,
  Req,
  UseGuards,
  Res,
  HttpStatus,
  UnauthorizedException,
  Body,
} from '@nestjs/common';
import { RequestWithVisitor } from './request-with-visitor.interface';
import { RequestWithVendor } from './request-with-vendor.interface';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CookieOptions, Response } from 'express';
import {
  RequestOtpDto,
  VerifyOtpDto,
  ResetPasswordDto,
} from './dto/password-reset.dto';

const buildCookieOptions = (): CookieOptions => {
  const configuredDomain = process.env.COOKIE_DOMAIN?.trim();
  const secure = process.env.COOKIE_SECURE === 'true';
  const configuredSameSite = process.env.COOKIE_SAMESITE === 'lax' ? 'lax' : 'none';

  const cookieOptions: CookieOptions = {
    httpOnly: false,
    secure,
    // Browsers reject SameSite=None when secure=false.
    sameSite: secure ? configuredSameSite : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  };

  // Domain=localhost breaks LAN access; omit to let browser use request host.
  if (configuredDomain && configuredDomain !== 'localhost') {
    cookieOptions.domain = configuredDomain;
  }

  return cookieOptions;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('loginVisitor')
  loginVisitor(@Req() req: RequestWithVisitor, @Res() res: Response): void {
    const visitor = req.visitor;
    if (!visitor) {
      throw new UnauthorizedException('Invalid credentials for visitor');
    }

    const { access_token } = this.authService.loginVisitor(visitor);
    res.cookie('access_token', access_token, buildCookieOptions());

    res.status(HttpStatus.OK).json({
      message: 'Login successful',
      access_token,
      visitorId: visitor.id,
      visitorEmail: visitor.email,
    });
  }

  @UseGuards(LocalAuthGuard)
  @Post('loginVendor')
  loginVendor(@Req() req: RequestWithVendor, @Res() res: Response): void {
    const vendor = req.vendor;
    if (!vendor) {
      throw new UnauthorizedException('Invalid credentials for vendor');
    }

    const { access_token } = this.authService.loginVendor(vendor);
    res.cookie('access_tokenVendor', access_token, buildCookieOptions());

    res.status(HttpStatus.OK).json({
      message: 'Login successful',
      access_token,
      vendorId: vendor.id,
      vendorEmail: vendor.email,
    });
  }

  @Post('forgot-password/request-otp')
  async requestOtp(@Body() body: RequestOtpDto) {
    return await this.authService.requestPasswordResetOtp(body.email, body.role);
  }

  @Post('forgot-password/verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    return await this.authService.verifyPasswordResetOtp(
      body.email,
      body.otp,
      body.role,
    );
  }

  @Post('forgot-password/reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return await this.authService.resetPassword(
      body.resetToken,
      body.newPassword,
      body.role,
    );
  }
}
