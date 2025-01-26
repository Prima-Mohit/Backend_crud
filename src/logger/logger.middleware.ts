import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  private readonly logFilePath = join(
    __dirname,
    '..',
    '..',
    'logs',
    'http.log',
  );

  constructor() {
    // Ensure the logs directory exists
    const logDir = join(__dirname, '..', '..', 'logs');
    if (!existsSync(logDir)) {
      mkdirSync(logDir);
    }
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
}
