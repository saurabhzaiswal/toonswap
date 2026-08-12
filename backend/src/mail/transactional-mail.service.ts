import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mjml2html from 'mjml';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class TransactionalMailService {
  private transporter?: Transporter;

  constructor(private readonly config: ConfigService) { }

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
      subject: `Your ToonSwap sign-in code`,
      text: `Here is your ToonSwap sign-in code. Open this email to view it. It expires in ${expiresInMinutes} minutes and works once. If you did not request it, ignore this email.\n\nCode: ${code}`,
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
    <mj-preview>Your ToonSwap one-time code expires in 10 minutes. Never share this code with anyone.</mj-preview>
    <mj-attributes>
      <mj-all font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif" />
      <mj-text color="#5b5766" font-size="14px" line-height="20px" />
    </mj-attributes>
    <mj-style>
      .otp-box { letter-spacing: 6px; }
    </mj-style>
  </mj-head>

  <mj-body background-color="#fdfbf8" width="480px">

    <!-- Logo header -->
    <mj-section padding="32px 16px 20px 16px">
      <mj-group>
        <mj-column width="40px" vertical-align="middle">
          <mj-image src="https://toonswap-kappa.vercel.app/favicon.svg" width="36px" height="36px" border-radius="9px" align="center" padding="0" />
        </mj-column>
        <mj-column width="140px" vertical-align="middle">
          <mj-text font-size="20px" font-weight="800" color="#17141f" padding="0 0 0 6px">
            Toon<span style="color:#ff624d;">Swap</span>
          </mj-text>
        </mj-column>
      </mj-group>
    </mj-section>

    <!-- Card -->
    <mj-wrapper background-color="#ffffff" border-radius="20px" padding="0" css-class="card-shadow">

      <!-- Accent bar -->
      <mj-section padding="0">
        <mj-column>
          <mj-divider border-width="6px" border-color="#ff624d" padding="0" />
        </mj-column>
      </mj-section>

      <mj-section padding="32px 36px 4px 36px">
        <mj-column>
          <mj-text align="center" font-size="14px" font-weight="600" letter-spacing="1px" text-transform="uppercase" color="#ff624d" padding="0">
            Sign-in code
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="4px 36px 0 36px">
        <mj-column>
          <mj-text align="center" font-size="22px" font-weight="700" color="#17141f" padding="0">
            Here's your one-time code
          </mj-text>
        </mj-column>
      </mj-section>

      <!-- OTP box -->
      <mj-section padding="24px 36px 8px 36px">
        <mj-column background-color="#fff4f0" border="1px solid #ffd8cf" border-radius="14px" padding="18px 0">
          <mj-text align="center" font-family="'Courier New', Courier, monospace" font-size="34px" font-weight="800" color="#ff624d" css-class="otp-box" padding="0">
             ${code}
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="16px 36px 0 36px">
        <mj-column>
          <mj-text align="center" font-size="14px" padding="0">
            This code expires in <strong style="color:#17141f;">10 minutes</strong> and can only be used once.
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="28px 36px 0 36px">
        <mj-column>
          <mj-divider border-width="1px" border-color="#f0ece4" padding="0" />
        </mj-column>
      </mj-section>

      <!-- Security notice -->
      <mj-section padding="20px 36px 8px 36px">
        <mj-column background-color="#faf8f4" border-radius="12px" padding="14px 18px">
          <mj-text font-size="13px" line-height="19px" padding="0">
             <strong style="color:#17141f;">ToonSwap will never call, text, or email you asking for this code.</strong> Don't share it with anyone, even someone claiming to be from ToonSwap support.
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="20px 36px 32px 36px">
        <mj-column>
          <mj-text align="center" font-size="13px" line-height="19px" color="#8b8794" padding="0">
            Didn't request this code? You can safely ignore this email — no changes will be made to your account.
          </mj-text>
        </mj-column>
      </mj-section>

    </mj-wrapper>

    <!-- Footer -->
    <mj-section padding="24px 20px 32px 20px">
      <mj-column>
        <mj-text align="center" font-size="12px" line-height="18px" color="#a29d9a" padding="0 0 6px 0">
          This is an automated message — please don't reply to this email.
        </mj-text>
        <mj-text align="center" font-size="12px" line-height="18px" color="#a29d9a" padding="0">
          Need help? Reach us at <a href="https://www.linkedin.com/in/saurabh-choudhary-7ab207239/" style="color:#ff624d; text-decoration:none;">LinkedIn</a>
        </mj-text>
        <mj-text align="center" font-size="11px" color="#c4bfba" padding="16px 0 0 0">
          © 2026 ToonSwap. Original stories. Safe sign-in.
        </mj-text>
      </mj-column>
    </mj-section>

  </mj-body>
</mjml>
`;
  }
}
