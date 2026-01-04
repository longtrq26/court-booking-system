import * as Brevo from '@getbrevo/brevo';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../user/entities/user.entity';
import { verificationEmailTemplate } from './templates/verification-email.template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private apiInstance: Brevo.TransactionalEmailsApi;

  constructor(private readonly configService: ConfigService) {
    this.apiInstance = new Brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      this.configService.getOrThrow<string>('BREVO_API_KEY'),
    );
  }

  async sendVerificationEmail(user: UserEntity, verificationToken: string) {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    // const clientUrl = this.configService.get<string>(
    //   'CLIENT_URL',
    //   'http://localhost:3000',
    // );
    // const url = `${clientUrl}/verify-email?id=${user.id}&token=${token}`;

    const serverUrl = this.configService.getOrThrow<string>('SERVER_URL');
    const apiPrefix = this.configService.getOrThrow<string>('API_PREFIX');
    const apiVersion = this.configService.getOrThrow<string>('API_VERSION');

    const url = `${serverUrl}/${apiPrefix}/${apiVersion}/auth/verify-email?userId=${user.id}&verificationToken=${verificationToken}`;

    sendSmtpEmail.subject =
      'Welcome to Court Booking System - Verify your Email';
    sendSmtpEmail.sender = {
      name: 'Court Booking System',
      email: this.configService.getOrThrow<string>('BREVO_MAILER_SENDER'),
    };
    sendSmtpEmail.to = [{ email: user.email, name: user.fullName }];

    sendSmtpEmail.htmlContent = verificationEmailTemplate(user.fullName, url);

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`Verification email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Error sending email to ${user.email}: ${JSON.stringify(error)}`,
      );
    }
  }
}
