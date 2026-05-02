import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { invitationTemplate } from './templates/invitation';
import { taskAssignedTemplate } from './templates/task-assigned';

export interface InvitationEmailData {
  recipientEmail: string;
  recipientName?: string;
  organizationName: string;
  inviterName?: string;
  role: string;
  inviteToken: string;
}

export interface TaskAssignedEmailData {
  recipientEmail: string;
  recipientName?: string;
  taskTitle: string;
  taskDescription?: string;
  projectName?: string;
  dueDate?: string;
  priority: string;
  assignerName?: string;
  organizationName: string;
  taskId: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private readonly from: string;
  private readonly frontendUrl: string;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('mail.host', 'localhost');
    const port = this.configService.get<number>('mail.port', 587);
    const secure = this.configService.get<boolean>('mail.secure', false);
    const user = this.configService.get<string>('mail.user', '');
    const pass = this.configService.get<string>('mail.pass', '');
    this.from = this.configService.get<string>('mail.from', 'TaskForge <noreply@taskforge.io>');
    this.frontendUrl = this.configService.get<string>('mail.frontendUrl', 'http://localhost:3001');

    this.enabled = !!user && !!pass;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      ...(this.enabled ? { auth: { user, pass } } : {}),
    });

    if (!this.enabled) {
      this.logger.warn('SMTP credentials not configured — emails will be logged but not sent');
    }
  }

  async sendInvitationEmail(data: InvitationEmailData): Promise<void> {
    const inviteUrl = `${this.frontendUrl}/invite/${data.inviteToken}`;
    const { html, text } = invitationTemplate({
      ...data,
      inviteUrl,
    });

    await this.send({
      to: data.recipientEmail,
      subject: `You've been invited to ${data.organizationName} on TaskForge`,
      html,
      text,
    });
  }

  async sendTaskAssignedEmail(data: TaskAssignedEmailData): Promise<void> {
    const taskUrl = `${this.frontendUrl}/tasks`;
    const { html, text } = taskAssignedTemplate({
      ...data,
      taskUrl,
    });

    await this.send({
      to: data.recipientEmail,
      subject: `Task assigned: ${data.taskTitle}`,
      html,
      text,
    });
  }

  private async send(options: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    try {
      if (!this.enabled) {
        this.logger.log(`[Email Preview] To: ${options.to} | Subject: ${options.subject}`);
        this.logger.debug(`[Email Text] ${options.text}`);
        return;
      }

      await this.transporter.sendMail({
        from: this.from,
        ...options,
      });

      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to send email to ${options.to}: ${err.message}`, err.stack);
    }
  }
}
