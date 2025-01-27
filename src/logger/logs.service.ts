import { Injectable, Logger } from '@nestjs/common';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { parseISO } from 'date-fns'; // Import from date-fns, not date-fns-tz

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);
  private readonly logDir = join(__dirname, '..', '..', 'logs');

  getLogsByDateRange(startDate: string, endDate: string): string {
    try {
      const start = parseISO(`${startDate}T00:00:00`);
      const end = parseISO(`${endDate}T23:59:59`);

      const files = readdirSync(this.logDir);
      const matchingLogs: string[] = [];

      files.forEach((file) => {
        const fileDate = parseISO(file.replace('.log', ''));
        if (fileDate >= start && fileDate <= end) {
          const filePath = join(this.logDir, file);
          const fileContent = readFileSync(filePath, 'utf8');
          matchingLogs.push(fileContent);
        }
      });

      return matchingLogs.join('\n');
    } catch (error) {
      this.logger.error(`Error fetching logs for range: ${error.message}`);
      throw error;
    }
  }
}
