import { Injectable } from '@nestjs/common';
import * as https from 'https';
import { createGunzip } from 'zlib';
import { parse } from 'csv-parse';

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
}
