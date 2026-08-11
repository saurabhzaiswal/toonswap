import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mjml2html from 'mjml';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class TransactionalMailService {
  private transporter?: Transporter;

  constructor(private readonly config: ConfigService) {}

  async sendLoginCode(email: string, code: string, expiresInMinutes: number) {
    const transporter = this.getTransporter();
    const from = this.config.get<string>('MAIL_FROM');
    if (!from) throw new ServiceUnavailableException('MAIL_FROM is not configured');

    const { html, errors } = await mjml2html(this.otpTemplate(code, expiresInMinutes), {
      validationLevel: 'strict',
      minify: true,
    });
    if (errors.length) throw new ServiceUnavailableException('Email template validation failed');

    await transporter.sendMail({
      from,
      to: email,
      subject: `${code} is your ToonSwap sign-in code`,
      text: `Your ToonSwap sign-in code is ${code}. It expires in ${expiresInMinutes} minutes. If you did not request it, ignore this email.`,
      html,
    });
  }

  private getTransporter() {
    if (this.transporter) return this.transporter;
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') || 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASSWORD');
    if (!host || !user || !pass)
      throw new ServiceUnavailableException('Email OTP delivery is not configured');
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      requireTLS: port !== 465,
    });
    return this.transporter;
  }

  private otpTemplate(code: string, expiresInMinutes: number) {
    return `<mjml>
      <mj-head>
        <mj-title>Your ToonSwap sign-in code</mj-title>
        <mj-preview>${code} is your ToonSwap code. It expires soon.</mj-preview>
        <mj-attributes>
          <mj-all font-family="Arial, Helvetica, sans-serif" />
          <mj-text color="#17141f" font-size="16px" line-height="1.6" />
          <mj-button background-color="#ff624d" border-radius="12px" color="#ffffff" font-weight="700" />
        </mj-attributes>
      </mj-head>
      <mj-body background-color="#fffaf2">
        <mj-section padding="28px 16px">
          <mj-column background-color="#ffffff" border="1px solid #ded6c8" border-radius="22px" padding="24px">
            <mj-text align="center" font-size="25px" font-weight="800" padding-bottom="4px">Toon<span style="color:#ff624d">Swap</span></mj-text>
            <mj-text align="center" color="#746f7c" padding-top="0">Original stories. Safe sign-in.</mj-text>
            <mj-divider border-color="#ded6c8" />
            <mj-text font-size="22px" font-weight="800">Your one-time code</mj-text>
            <mj-text align="center" background-color="#f3efff" border-radius="16px" color="#5b3ee4" font-size="38px" font-weight="900" letter-spacing="10px" padding="22px">${code}</mj-text>
            <mj-text>This code expires in <strong>${expiresInMinutes} minutes</strong> and works once. ToonSwap will never ask you to send this code in a chat or phone call.</mj-text>
            <mj-text color="#746f7c" font-size="13px">If you did not request this email, you can safely ignore it. No account action is completed without the code.</mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>`;
  }
}
