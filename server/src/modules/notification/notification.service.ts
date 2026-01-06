import { Injectable, Logger } from '@nestjs/common';
import { NotificationType } from '../../common/enums/notification/notification-type.enum';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  notifyAdmins(
    title: string,
    message: string,
    type: NotificationType,
    bookingId?: string,
    courtId?: string,
  ) {
    this.logger.log(
      `[Admin Notification] ${title}: ${message} (Type: ${type}, Booking: ${bookingId}, Court: ${courtId})`,
    );
    // Future: send to FCM, Socket.io, or email
    return true;
  }

  notifyUser(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
  ) {
    this.logger.log(
      `[User Notification] User ${userId} - ${title}: ${message} (Type: ${type})`,
    );
    return true;
  }
}
