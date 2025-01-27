import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  statSync,
  unlinkSync,
  readdirSync,
} from 'fs';
import { join } from 'path';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  private readonly logDir = join(__dirname, '..', '..', 'logs');
  private readonly logFilePath = join(this.logDir, 'http.log');
  private readonly cleanupIntervalMs = 1 * 60 * 1000; // 1 minute in milliseconds

  constructor() {
    // Ensure the logs directory exists
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir);
    }

    // Schedule recurring cleanup
    this.scheduleLogCleanup();
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const elapsedTime = Date.now() - start;
      const logMessage = `[${new Date().toISOString()}] [${method}] ${originalUrl} - ${statusCode} [${elapsedTime}ms]`;

      // Log to console
      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }

      // Save to file
      this.writeToFile(logMessage);
    });

    next();
  }

  private writeToFile(logMessage: string): void {
    appendFileSync(this.logFilePath, `${logMessage}\n`);
  }

  private scheduleLogCleanup(): void {
    setInterval(() => this.cleanupOldLogs(), this.cleanupIntervalMs);
  }

  private cleanupOldLogs(): void {
    try {
      const oneMinuteAgo = Date.now() - 1 * 60 * 1000; // 1 minute in milliseconds
      const files = readdirSync(this.logDir);

      files.forEach((file) => {
        const filePath = join(this.logDir, file);
        const fileStats = statSync(filePath);
        const fileCreationTime = new Date(fileStats.birthtime).getTime();

        if (fileCreationTime < oneMinuteAgo) {
          unlinkSync(filePath);
          this.logger.log(`Deleted old log file: ${filePath}`);
        }
      });
    } catch (error) {
      this.logger.error(`Error during log cleanup: ${error.message}`);
    }
  }
}
