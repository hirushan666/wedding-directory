import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === 'true';

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });
      this.logger.log(`Nodemailer transporter initialized with host: ${host}:${port}`);
    } else {
      this.logger.warn(
        'SMTP credentials not fully provided. MailService will operate in development fallback mode (logging OTPs to console).',
      );
    }
  }

  async sendOtpEmail(to: string, otp: string, role: 'visitor' | 'vendor'): Promise<boolean> {
    const from = process.env.SMTP_FROM || 'Say I Do <no-reply@sayido.lk>';
    const roleLabel = role === 'vendor' ? 'Wedding Vendor' : 'Couple / Visitor';
    const subject = `Your Password Reset OTP - Say I Do`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #ff6b35; margin: 0; font-size: 26px;">Say I Do</h2>
          <p style="color: #666666; font-size: 14px; margin-top: 4px;">Sri Lanka Wedding Directory</p>
        </div>
        
        <h3 style="color: #222222; font-size: 20px; margin-bottom: 12px;">Password Reset Request</h3>
        <p style="color: #444444; font-size: 15px; line-height: 1.5;">
          Hello, we received a request to reset your password for your <strong>${roleLabel}</strong> account.
        </p>
        
        <div style="background-color: #f8f9fa; border: 1px dashed #ff6b35; border-radius: 6px; padding: 18px; text-align: center; margin: 24px 0;">
          <span style="font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #888888; display: block; margin-bottom: 6px;">Your One-Time Code</span>
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #ff6b35; display: inline-block;">${otp}</span>
          <span style="display: block; font-size: 12px; color: #777777; margin-top: 8px;">Expires in 10 minutes</span>
        </div>

        <p style="color: #555555; font-size: 14px; line-height: 1.5;">
          Enter this 6-digit code on the verification screen to proceed with creating your new password.
        </p>

        <p style="color: #888888; font-size: 13px; line-height: 1.4; margin-top: 24px; border-top: 1px solid #eeeeee; padding-top: 16px;">
          If you did not request a password reset, please ignore this email or change your password if you suspect unauthorized access. Do not share this code with anyone.
        </p>

        <div style="text-align: center; margin-top: 24px; color: #aaaaaa; font-size: 12px;">
          © ${new Date().getFullYear()} Say I Do. All rights reserved.
        </div>
      </div>
    `;

    if (this.transporter) {
      try {
        this.logger.log(`[OTP DISPATCH] Generated code for ${to} (${role}): [ ${otp} ]`);
        await this.transporter.sendMail({
          from,
          to,
          subject,
          html,
          text: `Your Say I Do password reset OTP is ${otp}. It expires in 10 minutes.`,
        });
        this.logger.log(`Password reset OTP email sent successfully to ${to}`);
        return true;
      } catch (error) {
        this.logger.error(`Failed to send email to ${to}:`, error);
        // In case of SMTP connection error, still log fallback so the user isn't completely locked out during tests
        this.logger.warn(`FALLBACK OTP for ${to}: [ ${otp} ]`);
        return false;
      }
    } else {
      this.logger.log(
        `\n========================================\n[MAIL FALLBACK] Password Reset OTP for ${to} (${role}):\n>>> CODE: ${otp} <<<\nExpires in 10 minutes\n========================================\n`,
      );
      return true;
    }
  }
}
