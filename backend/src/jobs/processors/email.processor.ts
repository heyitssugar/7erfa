import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

interface SendEmailData {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    // For development, use ethereal.email
    // In production, configure with real SMTP settings
    this.transporter = nodemailer.createTransport({
      host: configService.get('SMTP_HOST', 'smtp.ethereal.email'),
      port: configService.get('SMTP_PORT', 587),
      secure: configService.get('SMTP_SECURE', false),
      auth: {
        user: configService.get('SMTP_USER'),
        pass: configService.get('SMTP_PASS'),
      },
    });
  }

  @Process('send')
  async handleSendEmail(job: Job<SendEmailData>) {
    try {
      const { to, subject, template, context } = job.data;

      // In a real application, you would use a template engine
      // For now, we'll just use a simple string replacement
      const html = this.renderTemplate(template, context);

      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM', '7erfa <no-reply@7erfa.com>'),
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw error;
    }
  }

  private renderTemplate(template: string, context: Record<string, any>): string {
    // Simple template rendering
    // In production, use a proper template engine like handlebars
    let rendered = template;
    Object.entries(context).forEach(([key, value]) => {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return rendered;
  }
}
