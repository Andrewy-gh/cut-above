import { format, createLogger, transports, Logger } from 'winston';
const { timestamp, combine, errors, json } = format;

export default function buildProdLogger() {
  return createLogger({
    format: combine(timestamp(), errors({ stack: true }), json()),
    defaultMeta: { service: 'user-service' },
    transports: [new transports.Console()],
  });
}
