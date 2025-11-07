import { Module } from '@nestjs/common';
import { HistoricalDataService } from './historicalData.service';
import { HistoricalDataController } from './historicalData.controller';

@Module({
  controllers: [HistoricalDataController],
  providers: [HistoricalDataService],
  exports: [HistoricalDataService],
})
export class HistoricalDataModule {}
