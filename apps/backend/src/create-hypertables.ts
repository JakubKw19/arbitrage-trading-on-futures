import { AppDataSource } from './data-source';
import { ArbitrageSpread } from './database/entities/ArbitrageSpread.entity';
import { getTimescaleMetadata } from './database/timescale-hypertable.decorator';

(async () => {
  const ds = await AppDataSource.initialize();

  const hypertableMeta = getTimescaleMetadata(ArbitrageSpread);
  if (hypertableMeta) {
    const tableName = 'arbitrage_spreads';
    const timeColumn = hypertableMeta.timeColumn;
    await ds.query(
      `SELECT create_hypertable('${tableName}', '${timeColumn}', if_not_exists => TRUE)`,
    );
    console.log(`Hypertable created: ${tableName} (${timeColumn})`);
  }

  await ds.destroy();
})();
