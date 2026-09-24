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
          &copy; ${new Date().getFullYear()} Say I Do. All rights reserved.
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

  async sendSignupOtpEmail(to: string, otp: string, role: 'visitor' | 'vendor'): Promise<boolean> {
    const from = process.env.SMTP_FROM || 'Say I Do <sayidolk@gmail.com>';
    const roleLabel = role === 'vendor' ? 'Wedding Vendor' : 'Couple / Visitor';
    const subject = `Verify Your Email - Say I Do`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #ff6b35; margin: 0; font-size: 26px;">Say I Do</h2>
          <p style="color: #666666; font-size: 14px; margin-top: 4px;">Sri Lanka Wedding Directory</p>
        </div>
        
        <h3 style="color: #222222; font-size: 20px; margin-bottom: 12px;">Confirm Your Email Address</h3>
        <p style="color: #444444; font-size: 15px; line-height: 1.5;">
          Welcome! You are registering a <strong>${roleLabel}</strong> account on Say I Do. Please use the verification code below to complete your registration.
        </p>
        
        <div style="background-color: #f8f9fa; border: 1px dashed #ff6b35; border-radius: 6px; padding: 18px; text-align: center; margin: 24px 0;">
          <span style="font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #888888; display: block; margin-bottom: 6px;">Your Verification Code</span>
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #ff6b35; display: inline-block;">${otp}</span>
          <span style="display: block; font-size: 12px; color: #777777; margin-top: 8px;">Expires in 10 minutes</span>
        </div>

        <p style="color: #555555; font-size: 14px; line-height: 1.5;">
          Enter this code on the sign-up screen to verify your email and activate your account.
        </p>

        <p style="color: #888888; font-size: 13px; line-height: 1.4; margin-top: 24px; border-top: 1px solid #eeeeee; padding-top: 16px;">
          If you did not sign up for Say I Do, please ignore this email.
        </p>

        <div style="text-align: center; margin-top: 24px; color: #aaaaaa; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Say I Do. All rights reserved.
        </div>
      </div>
    `;

    if (this.transporter) {
      try {
        this.logger.log(`[SIGNUP OTP] Generated code for ${to} (${role}): [ ${otp} ]`);
        await this.transporter.sendMail({
          from,
          to,
          subject,
          html,
          text: `Your Say I Do email verification code is ${otp}. It expires in 10 minutes.`,
        });
        this.logger.log(`Signup verification email sent successfully to ${to}`);
        return true;
      } catch (error) {
        this.logger.error(`Failed to send signup email to ${to}:`, error);
        this.logger.warn(`FALLBACK SIGNUP OTP for ${to}: [ ${otp} ]`);
        return false;
      }
    } else {
      this.logger.log(
        `\n========================================\n[MAIL FALLBACK] Sign-Up OTP for ${to} (${role}):\n>>> CODE: ${otp} <<<\nExpires in 10 minutes\n========================================\n`,
      );
      return true;
    }
  }

  async sendApprovalDecisionEmail(options: {
    to: string;
    visitorName: string;
    packageName: string;
    vendorName: string;
    bookingDate: Date;
    action: 'approved' | 'rejected';
    vendorMessage?: string;
    expiresAt?: Date;
  }): Promise<boolean> {
    const from = process.env.SMTP_FROM || 'Say I Do <no-reply@sayido.lk>';
    const isApproved = options.action === 'approved';
    const subject = isApproved
      ? `🎉 Booking Request Approved: ${options.packageName} - Say I Do`
      : `Booking Request Update: ${options.packageName} - Say I Do`;

    const formattedDate = new Date(options.bookingDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedExpiry = options.expiresAt
      ? new Date(options.expiresAt).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        })
      : '24 hours';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #ff6b35; margin: 0; font-size: 26px;">Say I Do</h2>
          <p style="color: #666666; font-size: 14px; margin-top: 4px;">Sri Lanka Wedding Directory</p>
        </div>
        
        <h3 style="color: #222222; font-size: 20px; margin-bottom: 12px;">
          ${isApproved ? '🎉 Great news! Your request was approved.' : 'Booking Request Update'}
        </h3>
        
        <p style="color: #444444; font-size: 15px; line-height: 1.5;">
          Hello ${options.visitorName || 'there'},<br/><br/>
          ${
            isApproved
              ? `<strong>${options.vendorName}</strong> has approved your request for package <strong>${options.packageName}</strong> on <strong>${formattedDate}</strong>!`
              : `<strong>${options.vendorName}</strong> was unable to accept your request for package <strong>${options.packageName}</strong> on <strong>${formattedDate}</strong>.`
          }
        </p>
        
        ${
          options.vendorMessage
            ? `<div style="background-color: #f8f9fa; border-left: 4px solid #ff6b35; padding: 12px 16px; margin: 18px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #555555; font-style: italic;">
                  "${options.vendorMessage}"
                </p>
                <span style="font-size: 12px; color: #888888; display: block; margin-top: 6px;">ΓÇö Message from vendor</span>
              </div>`
            : ''
        }

        ${
          isApproved
            ? `<div style="background-color: #fff8f5; border: 1px dashed #ff6b35; border-radius: 6px; padding: 18px; text-align: center; margin: 24px 0;">
                <span style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #ff6b35; display: block; margin-bottom: 6px; font-weight: bold;">
                  Payment Window: 24 Hours
                </span>
                <p style="font-size: 14px; color: #444444; margin: 6px 0;">
                  Please complete your advance payment within 24 hours (before ${formattedExpiry}) to confirm your booking date. Otherwise, your reservation hold will be automatically released.
                </p>
              </div>`
            : ''
        }

        <div style="text-align: center; margin-top: 24px; color: #aaaaaa; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Say I Do. All rights reserved.
        </div>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: options.to,
          subject,
          html,
          text: `${subject}\n\nVendor: ${options.vendorName}\nPackage: ${options.packageName}\nDate: ${formattedDate}\n${
            options.vendorMessage ? `Note: ${options.vendorMessage}` : ''
          }`,
        });
        this.logger.log(`Approval decision email sent successfully to ${options.to}`);
        return true;
      } catch (error) {
        this.logger.error(`Failed to send approval decision email to ${options.to}:`, error);
        return false;
      }
    } else {
      this.logger.log(
        `\n[MAIL FALLBACK] Approval email to ${options.to}:\nSubject: ${subject}\nStatus: ${options.action}\nVendor: ${options.vendorName}\n`,
      );
      return true;
    }
  }

  async sendPackagePurchaseUserEmail(options: {
    to: string;
    visitorName: string;
    packageName: string;
    serviceName?: string;
    vendorName: string;
    vendorEmail?: string;
    vendorPhone?: string;
    amount: number;
    bookingDate?: Date;
    paymentReference: string;
  }): Promise<boolean> {
    const from = process.env.SMTP_FROM || 'Say I Do <no-reply@sayido.lk>';
    const subject = `🎉 Booking Confirmed: ${options.packageName} - Say I Do`;
    const formattedAmount = Number(options.amount || 0).toLocaleString();
    const formattedDate = options.bookingDate
      ? new Date(options.bookingDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'To be scheduled with vendor';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #ff6b35; margin: 0; font-size: 26px;">Say I Do</h2>
          <p style="color: #666666; font-size: 14px; margin-top: 4px;">Sri Lanka Wedding Directory</p>
        </div>

        <div style="background-color: #fff8f5; border: 1px solid #ffd8cc; border-radius: 6px; padding: 18px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 20px; font-weight: bold; color: #ff6b35; display: block; margin-bottom: 4px;">
            Booking Confirmed!
          </span>
          <span style="font-size: 14px; color: #555555;">
            Thank you for booking through Say I Do. Your payment has been received.
          </span>
        </div>

        <h3 style="color: #222222; font-size: 18px; margin-bottom: 12px; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px;">
          Booking Summary
        </h3>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.8; color: #333333; margin-bottom: 20px;">
          <tr>
            <td style="color: #777777; width: 38%; padding: 4px 0;">Customer Name:</td>
            <td style="font-weight: 600; padding: 4px 0;">${options.visitorName || 'Valued Couple'}</td>
          </tr>
          <tr>
            <td style="color: #777777; padding: 4px 0;">Package:</td>
            <td style="font-weight: 600; padding: 4px 0;">${options.packageName}</td>
          </tr>
          ${
            options.serviceName
              ? `<tr>
                  <td style="color: #777777; padding: 4px 0;">Service / Offering:</td>
                  <td style="padding: 4px 0;">${options.serviceName}</td>
                </tr>`
              : ''
          }
          <tr>
            <td style="color: #777777; padding: 4px 0;">Vendor / Business:</td>
            <td style="font-weight: 600; padding: 4px 0;">${options.vendorName}</td>
          </tr>
          <tr>
            <td style="color: #777777; padding: 4px 0;">Booking Date:</td>
            <td style="font-weight: 600; color: #ff6b35; padding: 4px 0;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="color: #777777; padding: 4px 0;">Total Amount Paid:</td>
            <td style="font-weight: 700; font-size: 16px; color: #222222; padding: 4px 0;">LKR ${formattedAmount}</td>
          </tr>
          <tr>
            <td style="color: #777777; padding: 4px 0;">Payment Reference:</td>
            <td style="font-family: monospace; font-size: 13px; color: #555555; padding: 4px 0;">${options.paymentReference}</td>
          </tr>
        </table>

        ${
          options.vendorEmail || options.vendorPhone
            ? `<div style="background-color: #f8f9fa; border-radius: 6px; padding: 14px 18px; margin: 20px 0;">
                <span style="font-size: 13px; font-weight: bold; color: #444444; display: block; margin-bottom: 6px;">Vendor Contact Details</span>
                ${options.vendorPhone ? `<p style="margin: 3px 0; font-size: 13px; color: #555555;">📞 Phone: <strong>${options.vendorPhone}</strong></p>` : ''}
                ${options.vendorEmail ? `<p style="margin: 3px 0; font-size: 13px; color: #555555;">✉️ Email: <strong>${options.vendorEmail}</strong></p>` : ''}
              </div>`
            : ''
        }

        <p style="color: #555555; font-size: 13px; line-height: 1.5; margin-top: 20px;">
          You can also check your booking and communicate directly with your vendor anytime via the Say I Do mobile app under your <strong>Reservations</strong> tab.
        </p>

        <div style="text-align: center; margin-top: 24px; color: #aaaaaa; font-size: 12px; border-top: 1px solid #eeeeee; padding-top: 16px;">
          &copy; ${new Date().getFullYear()} Say I Do. All rights reserved.
        </div>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: options.to,
          subject,
          html,
          text: `Booking Confirmed!\nPackage: ${options.packageName}\nVendor: ${options.vendorName}\nDate: ${formattedDate}\nAmount: LKR ${formattedAmount}\nReference: ${options.paymentReference}`,
        });
        this.logger.log(`Package purchase confirmation email sent to user ${options.to}`);
        return true;
      } catch (error) {
        this.logger.error(`Failed to send package purchase email to user ${options.to}:`, error);
        return false;
      }
    } else {
      this.logger.log(
        `\n[MAIL FALLBACK] User Purchase Confirmation Email to ${options.to}:\nSubject: ${subject}\nPackage: ${options.packageName}\nVendor: ${options.vendorName}\nReference: ${options.paymentReference}\n`,
      );
      return true;
    }
  }

  async sendPackagePurchaseVendorEmail(options: {
    to: string;
    vendorName: string;
    visitorName: string;
    visitorEmail: string;
    visitorPhone?: string;
    packageName: string;
    serviceName?: string;
    amount: number;
    bookingDate?: Date;
    paymentReference: string;
  }): Promise<boolean> {
    const from = process.env.SMTP_FROM || 'Say I Do <no-reply@sayido.lk>';
    const subject = `🎉 New Package Purchase: ${options.packageName} - Say I Do`;
    const formattedAmount = Number(options.amount || 0).toLocaleString();
    const formattedDate = options.bookingDate
      ? new Date(options.bookingDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Date to be confirmed';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #ff6b35; margin: 0; font-size: 26px;">Say I Do</h2>
          <p style="color: #666666; font-size: 14px; margin-top: 4px;">Vendor Booking Alert</p>
        </div>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 18px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 20px; font-weight: bold; color: #16a34a; display: block; margin-bottom: 4px;">
            🎉 Congratulations! You have a new booking.
          </span>
          <span style="font-size: 14px; color: #4b5563;">
            A couple has successfully purchased and reserved your wedding package.
          </span>
        </div>

        <p style="color: #444444; font-size: 15px; line-height: 1.5;">
          Hello <strong>${options.vendorName}</strong>,<br/>
          Great news! A client has reserved and paid for your package on Say I Do.
        </p>

        <h3 style="color: #222222; font-size: 18px; margin-bottom: 12px; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px;">
          Booking & Customer Details
        </h3>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.8; color: #333333; margin-bottom: 20px;">
          <tr>
            <td style="color: #777777; width: 38%; padding: 4px 0;">Couple / Client:</td>
            <td style="font-weight: 600; padding: 4px 0;">${options.visitorName || 'Couple'}</td>
          </tr>
          <tr>
            <td style="color: #777777; padding: 4px 0;">Client Email:</td>
            <td style="padding: 4px 0;"><a href="mailto:${options.visitorEmail}" style="color: #ff6b35; text-decoration: none;">${options.visitorEmail}</a></td>
          </tr>
          ${
            options.visitorPhone
              ? `<tr>
                  <td style="color: #777777; padding: 4px 0;">Client Phone:</td>
                  <td style="padding: 4px 0;">${options.visitorPhone}</td>
                </tr>`
              : ''
          }
          <tr>
            <td style="color: #777777; padding: 4px 0;">Package Booked:</td>
            <td style="font-weight: 600; padding: 4px 0;">${options.packageName}</td>
          </tr>
          ${
            options.serviceName
              ? `<tr>
                  <td style="color: #777777; padding: 4px 0;">Service Offering:</td>
                  <td style="padding: 4px 0;">${options.serviceName}</td>
                </tr>`
              : ''
          }
          <tr>
            <td style="color: #777777; padding: 4px 0;">Reserved Event Date:</td>
            <td style="font-weight: 600; color: #ff6b35; padding: 4px 0;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="color: #777777; padding: 4px 0;">Amount Paid:</td>
            <td style="font-weight: 700; font-size: 16px; color: #222222; padding: 4px 0;">LKR ${formattedAmount}</td>
          </tr>
          <tr>
            <td style="color: #777777; padding: 4px 0;">Payment Reference:</td>
            <td style="font-family: monospace; font-size: 13px; color: #555555; padding: 4px 0;">${options.paymentReference}</td>
          </tr>
        </table>

        <div style="background-color: #f8f9fa; border-left: 4px solid #ff6b35; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #444444; line-height: 1.5;">
            <strong>Next Steps:</strong> Please check your Say I Do Vendor App to review the booking schedule and contact the couple to finalize wedding day arrangements.
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; color: #aaaaaa; font-size: 12px; border-top: 1px solid #eeeeee; padding-top: 16px;">
          &copy; ${new Date().getFullYear()} Say I Do. All rights reserved.
        </div>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: options.to,
          subject,
          html,
          text: `New Package Purchase!\nClient: ${options.visitorName} (${options.visitorEmail})\nPackage: ${options.packageName}\nDate: ${formattedDate}\nAmount: LKR ${formattedAmount}\nReference: ${options.paymentReference}`,
        });
        this.logger.log(`Package purchase alert email sent to vendor ${options.to}`);
        return true;
      } catch (error) {
        this.logger.error(`Failed to send package purchase email to vendor ${options.to}:`, error);
        return false;
      }
    } else {
      this.logger.log(
        `\n[MAIL FALLBACK] Vendor Purchase Alert Email to ${options.to}:\nSubject: ${subject}\nClient: ${options.visitorName}\nPackage: ${options.packageName}\nAmount: LKR ${formattedAmount}\n`,
      );
      return true;
    }
  }

  async sendPackageApprovalRequestVendorEmail(options: {
    to: string;
    vendorName: string;
    visitorName: string;
    visitorEmail: string;
    visitorPhone?: string;
    packageName: string;
    serviceName?: string;
    bookingDate: Date;
    userNote?: string;
    requestId: string;
  }): Promise<boolean> {
    const from = process.env.SMTP_FROM || 'Say I Do <no-reply@sayido.lk>';
    const subject = `💍 New Package Approval Request: ${options.packageName} - Say I Do`;
    const formattedDate = new Date(options.bookingDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #ff6b35; margin: 0; font-size: 26px;">Say I Do</h2>
          <p style="color: #666666; font-size: 14px; margin-top: 4px;">Package Approval Request</p>
        </div>

        <h3 style="color: #222222; font-size: 18px; margin-bottom: 12px;">
          New Booking Request Awaiting Your Approval
        </h3>

        <p style="color: #444444; font-size: 14px; line-height: 1.5;">
          Hello <strong>${options.vendorName}</strong>,<br/><br/>
          A couple is requesting your approval to purchase and reserve your package <strong>${options.packageName}</strong> for their wedding.
        </p>

        <div style="background-color: #f8f9fa; border: 1px solid #eaeaea; border-radius: 6px; padding: 16px; margin: 18px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.7; color: #333333;">
            <tr>
              <td style="color: #777777; width: 35%; padding: 4px 0;">Couple:</td>
              <td style="font-weight: 600; padding: 4px 0;">${options.visitorName || 'A Couple'}</td>
            </tr>
            <tr>
              <td style="color: #777777; padding: 4px 0;">Contact Email:</td>
              <td style="padding: 4px 0;"><a href="mailto:${options.visitorEmail}" style="color: #ff6b35; text-decoration: none;">${options.visitorEmail}</a></td>
            </tr>
            <tr>
              <td style="color: #777777; padding: 4px 0;">Package:</td>
              <td style="font-weight: 600; padding: 4px 0;">${options.packageName}</td>
            </tr>
            ${
              options.serviceName
                ? `<tr>
                    <td style="color: #777777; padding: 4px 0;">Service Offering:</td>
                    <td style="padding: 4px 0;">${options.serviceName}</td>
                  </tr>`
                : ''
            }
            <tr>
              <td style="color: #777777; padding: 4px 0;">Requested Date:</td>
              <td style="font-weight: 600; color: #ff6b35; padding: 4px 0;">${formattedDate}</td>
            </tr>
          </table>

          ${
            options.userNote
              ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #dddddd;">
                  <span style="font-size: 12px; font-weight: bold; color: #666666; text-transform: uppercase;">Note from Couple:</span>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #444444; font-style: italic;">
                    "${options.userNote}"
                  </p>
                </div>`
              : ''
          }
        </div>

        <div style="background-color: #fff8f5; border: 1px dashed #ff6b35; border-radius: 6px; padding: 14px; text-align: center; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #444444; line-height: 1.4;">
            Please open the <strong>Say I Do App &gt; Reservations &gt; Approvals</strong> tab to approve or decline this booking request.
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; color: #aaaaaa; font-size: 12px; border-top: 1px solid #eeeeee; padding-top: 16px;">
          &copy; ${new Date().getFullYear()} Say I Do. All rights reserved.
        </div>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: options.to,
          subject,
          html,
          text: `New Booking Approval Request!\nCouple: ${options.visitorName}\nPackage: ${options.packageName}\nDate: ${formattedDate}\nNote: ${options.userNote || 'None'}`,
        });
        this.logger.log(`Package approval request email sent to vendor ${options.to}`);
        return true;
      } catch (error) {
        this.logger.error(`Failed to send package approval request email to vendor ${options.to}:`, error);
        return false;
      }
    } else {
      this.logger.log(
        `\n[MAIL FALLBACK] Approval Request Email to Vendor ${options.to}:\nSubject: ${subject}\nCouple: ${options.visitorName}\nPackage: ${options.packageName}\nDate: ${formattedDate}\n`,
      );
      return true;
    }
  }

  async sendVisitorSignupWelcomeEmail(options: {
    to: string;
    visitorName: string;
  }): Promise<boolean> {
    const from = process.env.SMTP_FROM || 'Say I Do <no-reply@sayido.lk>';
    const subject = `Welcome to Say I Do! 💍 Your Wedding Planning Journey Begins`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #ff6b35; margin: 0; font-size: 26px;">Say I Do</h2>
          <p style="color: #666666; font-size: 14px; margin-top: 4px;">Sri Lanka Wedding Directory</p>
        </div>

        <h3 style="color: #222222; font-size: 20px; margin-bottom: 12px; text-align: center;">
          Welcome, ${options.visitorName || 'Happy Couple'}! 🎉
        </h3>

        <p style="color: #444444; font-size: 15px; line-height: 1.6;">
          Congratulations on your upcoming wedding! We are delighted to welcome you to <strong>Say I Do</strong>, Sri Lanka's premier wedding directory and planning destination.
        </p>

        <div style="background-color: #f8f9fa; border-radius: 6px; padding: 18px; margin: 24px 0;">
          <h4 style="margin: 0 0 12px 0; color: #ff6b35; font-size: 16px;">What you can do on Say I Do:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #444444; font-size: 14px; line-height: 1.8;">
            <li><strong>Discover Top Vendors:</strong> Browse verified wedding photographers, venues, caterers, makeup artists, and more.</li>
            <li><strong>Explore Exclusive Packages:</strong> Compare detailed service packages and request custom date approvals.</li>
            <li><strong>Secure Bookings:</strong> Book packages safely online with immediate date hold confirmations.</li>
            <li><strong>Wedding Planning Tools:</strong> Keep your big day organized with our digital wedding checklist & budget calculator.</li>
          </ul>
        </div>

        <p style="color: #555555; font-size: 14px; line-height: 1.5;">
          Start exploring today and find everything you need to create the wedding of your dreams!
        </p>

        <div style="text-align: center; margin-top: 24px; color: #aaaaaa; font-size: 12px; border-top: 1px solid #eeeeee; padding-top: 16px;">
          &copy; ${new Date().getFullYear()} Say I Do. All rights reserved.
        </div>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: options.to,
          subject,
          html,
          text: `Welcome to Say I Do!\nCongratulations on your wedding planning journey, ${options.visitorName || 'Happy Couple'}! Discover Sri Lanka's top wedding vendors and packages at Say I Do.`,
        });
        this.logger.log(`Visitor welcome email sent to ${options.to}`);
        return true;
      } catch (error) {
        this.logger.error(`Failed to send visitor welcome email to ${options.to}:`, error);
        return false;
      }
    } else {
      this.logger.log(
        `\n[MAIL FALLBACK] Visitor Welcome Email to ${options.to}:\nSubject: ${subject}\nName: ${options.visitorName}\n`,
      );
      return true;
    }
  }

  async sendVendorSignupWelcomeEmail(options: {
    to: string;
    vendorName: string;
    businessName: string;
  }): Promise<boolean> {
    const from = process.env.SMTP_FROM || 'Say I Do <no-reply@sayido.lk>';
    const subject = `Welcome to Say I Do! Vendor Registration Received 🌟`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #ff6b35; margin: 0; font-size: 26px;">Say I Do</h2>
          <p style="color: #666666; font-size: 14px; margin-top: 4px;">Vendor Partner Community</p>
        </div>

        <h3 style="color: #222222; font-size: 20px; margin-bottom: 12px;">
          Welcome, ${options.businessName || options.vendorName}!
        </h3>

        <p style="color: #444444; font-size: 15px; line-height: 1.6;">
          Thank you for joining <strong>Say I Do</strong> as a vendor partner. Your registration has been received successfully!
        </p>

        <div style="background-color: #fff8f5; border: 1px solid #ffd8cc; border-radius: 6px; padding: 18px; margin: 20px 0;">
          <span style="font-size: 14px; font-weight: bold; color: #ff6b35; display: block; margin-bottom: 6px;">
            Registration Status: Profile Created
          </span>
          <p style="margin: 0; font-size: 13px; color: #555555; line-height: 1.5;">
            Our team reviews new vendor listings to maintain top quality for couples across Sri Lanka. In the meantime, you can immediately begin setting up your profile and offerings.
          </p>
        </div>

        <div style="background-color: #f8f9fa; border-radius: 6px; padding: 18px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #222222; font-size: 15px;">Next Steps to Grow Your Bookings:</h4>
          <ol style="margin: 0; padding-left: 20px; color: #444444; font-size: 14px; line-height: 1.8;">
            <li><strong>Complete Your Profile:</strong> Add your business bio, location, contact information, and logo.</li>
            <li><strong>Create Service Offerings:</strong> Add your packages with transparent pricing, features, and photos.</li>
            <li><strong>Manage Requests:</strong> Review incoming package booking requests and approvals directly in your app.</li>
          </ol>
        </div>

        <p style="color: #555555; font-size: 14px; line-height: 1.5;">
          If you have any questions or need assistance onboarding, reply directly to this email or reach us at <a href="mailto:sayidolk@gmail.com" style="color: #ff6b35; text-decoration: none;">sayidolk@gmail.com</a>.
        </p>

        <div style="text-align: center; margin-top: 24px; color: #aaaaaa; font-size: 12px; border-top: 1px solid #eeeeee; padding-top: 16px;">
          &copy; ${new Date().getFullYear()} Say I Do. All rights reserved.
        </div>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: options.to,
          subject,
          html,
          text: `Welcome to Say I Do, ${options.businessName}!\nYour vendor account has been created. Start setting up your profile and packages to reach couples planning their wedding.`,
        });
        this.logger.log(`Vendor welcome email sent to ${options.to}`);
        return true;
      } catch (error) {
        this.logger.error(`Failed to send vendor welcome email to ${options.to}:`, error);
        return false;
      }
    } else {
      this.logger.log(
        `\n[MAIL FALLBACK] Vendor Welcome Email to ${options.to}:\nSubject: ${subject}\nBusiness: ${options.businessName}\n`,
      );
      return true;
    }
  }

  async sendAdminNewVendorAlertEmail(options: {
    adminEmail?: string;
    vendorName: string;
    businessName: string;
    vendorEmail: string;
    phone?: string;
    city?: string;
    location?: string;
  }): Promise<boolean> {
    const to = options.adminEmail || process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'sayidolk@gmail.com';
    const from = process.env.SMTP_FROM || 'Say I Do System <no-reply@sayido.lk>';
    const subject = `📋 New Vendor Signup: ${options.businessName || options.vendorName} - Review Request`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #ff6b35; margin: 0; font-size: 26px;">Say I Do</h2>
          <p style="color: #666666; font-size: 14px; margin-top: 4px;">Admin Notification</p>
        </div>

        <h3 style="color: #222222; font-size: 18px; margin-bottom: 12px;">
          New Vendor Registration Awaiting Review
        </h3>

        <p style="color: #444444; font-size: 14px; line-height: 1.5;">
          A new wedding vendor has registered on the Say I Do platform. Details are below:
        </p>

        <div style="background-color: #f8f9fa; border: 1px solid #eaeaea; border-radius: 6px; padding: 16px; margin: 18px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.8; color: #333333;">
            <tr>
              <td style="color: #777777; width: 35%; padding: 4px 0;">Business Name:</td>
              <td style="font-weight: 600; padding: 4px 0;">${options.businessName || 'N/A'}</td>
            </tr>
            <tr>
              <td style="color: #777777; padding: 4px 0;">Contact Name:</td>
              <td style="font-weight: 600; padding: 4px 0;">${options.vendorName || 'N/A'}</td>
            </tr>
            <tr>
              <td style="color: #777777; padding: 4px 0;">Email:</td>
              <td style="padding: 4px 0;"><a href="mailto:${options.vendorEmail}" style="color: #ff6b35;">${options.vendorEmail}</a></td>
            </tr>
            <tr>
              <td style="color: #777777; padding: 4px 0;">Phone:</td>
              <td style="padding: 4px 0;">${options.phone || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="color: #777777; padding: 4px 0;">City / Location:</td>
              <td style="padding: 4px 0;">${[options.city, options.location].filter(Boolean).join(', ') || 'Not provided'}</td>
            </tr>
          </table>
        </div>

        <p style="color: #555555; font-size: 13px; line-height: 1.5;">
          Please check the administration portal to verify the vendor's profile and services.
        </p>

        <div style="text-align: center; margin-top: 24px; color: #aaaaaa; font-size: 12px; border-top: 1px solid #eeeeee; padding-top: 16px;">
          &copy; ${new Date().getFullYear()} Say I Do Admin System
        </div>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to,
          subject,
          html,
          text: `New Vendor Signup:\nBusiness: ${options.businessName}\nName: ${options.vendorName}\nEmail: ${options.vendorEmail}\nPhone: ${options.phone || 'N/A'}`,
        });
        this.logger.log(`Admin new vendor alert email sent to ${to}`);
        return true;
      } catch (error) {
        this.logger.error(`Failed to send admin new vendor alert email to ${to}:`, error);
        return false;
      }
    } else {
      this.logger.log(
        `\n[MAIL FALLBACK] Admin Alert: New Vendor Signup:\nBusiness: ${options.businessName}\nContact: ${options.vendorName}\nEmail: ${options.vendorEmail}\n`,
      );
      return true;
    }
  }
}

