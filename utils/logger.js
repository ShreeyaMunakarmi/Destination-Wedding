import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message, ...meta }) => {
      let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
      if (Object.keys(meta).length) {
        log += ` | ${JSON.stringify(meta)}`;
      }
      return log;
    })
  ),
  transports: [
    new transports.Console(), // Log to console
    new DailyRotateFile({
      filename: 'logs/app-%DATE%.log', // Log files will be stored in "logs" directory
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d', // Keep logs for 14 days
    }),
  ],
});

export default logger;
