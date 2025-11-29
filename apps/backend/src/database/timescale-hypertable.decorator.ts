import 'reflect-metadata';

export const TIMESCALE_METADATA_KEY = Symbol('timescale:hypertable');

export function TimescaleHypertable(timeColumn: string) {
  return function (target: Function) {
    Reflect.defineMetadata(TIMESCALE_METADATA_KEY, { timeColumn }, target);
  };
}

export function getTimescaleMetadata(target: Function) {
  return Reflect.getMetadata(TIMESCALE_METADATA_KEY, target);
}
