import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns-tz'; // Use format from date-fns-tz
import { LogsDeletionService } from './log.delete'; // Import LogsDeletionService
import { join } from 'path';
import { appendFileSync } from 'fs';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  private readonly logDir = join(__dirname, '..', '..', 'logs');
  private readonly timeZone = 'Asia/Kolkata'; // Set your desired timezone

  constructor(private readonly logsDeletionService: LogsDeletionService) {
    this.scheduleLogCleanup();
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const elapsedTime = Date.now() - start;

      // Format timestamp in Asia/Kolkata timezone
      const zonedTime = toZonedTime(new Date(), this.timeZone);
      const formattedTime = format(
        zonedTime,
        'yyyy-MM-dd hh:mm:ss a', // e.g., 2025-01-27 06:45:23 PM
        { timeZone: this.timeZone },
      );

      const logMessage = `[${formattedTime}] [${method}] ${originalUrl} - ${statusCode} [${elapsedTime}ms]`;

      // Log to console
      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }

      // Save to date-based log file
      this.writeToFile(logMessage);
    });

    next();
  }

  private writeToFile(logMessage: string): void {
    const zonedTime = toZonedTime(new Date(), this.timeZone);
    const logFileName = `${format(zonedTime, 'yyyy-MM-dd', {
      timeZone: this.timeZone,
    })}.log`;

    const logFilePath = join(this.logDir, logFileName);
    appendFileSync(logFilePath, `${logMessage}\n`);
  }

  private scheduleLogCleanup(): void {
    setInterval(() => this.logsDeletionService.deleteOldLogs(), 60 * 1000); // 1-minute interval to check for old logs
  }
}
