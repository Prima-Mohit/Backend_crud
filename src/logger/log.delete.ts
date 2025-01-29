import { Injectable, Logger } from '@nestjs/common';
import { readdirSync, statSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class LogsDeletionService {
  private readonly logger = new Logger(LogsDeletionService.name);
  private readonly logDir = join(__dirname, '..', '..', 'logs');
  private readonly retentionPeriodMs = 3*24 * 60 * 60 * 1000; // 1 minute retention period for example

  //Deletes old log files based on retention period.

  deleteOldLogs(): void {
    try {
      const files = readdirSync(this.logDir);
      const now = Date.now();

      files.forEach((file) => {
        const filePath = join(this.logDir, file);
        const fileStats = statSync(filePath);
        const fileCreationTime = new Date(fileStats.birthtime).getTime();

        // If the file is older than the retention period, delete it
        if (now - fileCreationTime > this.retentionPeriodMs) {
          unlinkSync(filePath);
          this.logger.log(`Deleted old log file: ${filePath}`);
        }
      });
    } catch (error) {
      this.logger.error(`Error during log cleanup: ${error.message}`);
    }
  }
}
