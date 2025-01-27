import { Controller, Get, Query } from '@nestjs/common';
import { LogsService } from './logs.service'; // Import the LogsService

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get('range')
  getLogsByRange(
    @Query('start') startDate: string, // Accept start date from query param
    @Query('end') endDate: string, // Accept end date from query param
  ): string {
    try {
      // Call the getLogsByDateRange method from LogsService
      const logs = this.logsService.getLogsByDateRange(startDate, endDate);
      return logs; // Return the logs as a string
    } catch (error) {
      return `Error retrieving logs: ${error.message}`;
    }
  }
}
