import { Injectable } from '@nestjs/common';
import * as https from 'https';
import { createGunzip } from 'zlib';
import { parse } from 'csv-parse';

import { ArbitrageSpread as ArbitrageSpreadEntity } from '../database/entities/ArbitrageSpread.entity';
import { AppDataSource } from '../data-source';
import { ArbitrageSpread } from '../market/types/marketExchanges';

@Injectable()
export class HistoricalDataService {
  async streamBookTicker(exchange) {
    // const fileUrl = `https://data.binance.vision/?prefix=data/futures/um/daily/bookTicker/${symbol}/${symbol}-bookTicker-${date}.zip`;
    // return new Promise<void>((resolve, reject) => {
    //   https.get(fileUrl, (res) => {
    //     if (res.statusCode !== 200) {
    //       reject(new Error(`Failed to fetch: ${res.statusCode}`));
    //       return;
    //     }
    //     res
    //       .pipe(createGunzip())
    //       .pipe(parse({ columns: true }))
    //       .on('data', (row) => {
    //         console.log(
    //           `ts=${row.timestamp}, bid=${row.bidPrice}, ask=${row.askPrice}`,
    //         );
    //       })
    //       .on('end', () => {
    //         console.log('Finished processing data stream.');
    //         resolve();
    //       })
    //       .on('error', (err) => {
    //         console.error('Error processing stream', err);
    //         reject(err);
    //       });
    //   });
    // });
  }

  async insertArbitrageSpread(data: ArbitrageSpread[]) {
    try {
      const repo = AppDataSource.getRepository(ArbitrageSpreadEntity);
      await repo.save(data as ArbitrageSpreadEntity[]);
      console.log(`Inserted ${data.length} spreads into DB`);
    } catch (err) {
      console.error('Failed to write arbitrage spreads:', err);
    }
  }
}
