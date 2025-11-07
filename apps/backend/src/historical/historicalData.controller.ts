import { Controller, Get, Query } from '@nestjs/common';
import { HistoricalDataService } from './historicalData.service';

@Controller('historicalData')
export class HistoricalDataController {
  constructor(private readonly historicalDataService: HistoricalDataService) {}

  // @Get('bookTicker')
  // async streamBookTicker(
  //   @Query('symbol') symbol: string,
  //   @Query('date') date: string,
  // ) {
  //   await this.historicalDataService.streamBookTicker(
  //     symbol || 'BTCUSDT',
  //     date || '2024-10-10',
  //   );
  //   return { status: 'completed' };
  // }
}
