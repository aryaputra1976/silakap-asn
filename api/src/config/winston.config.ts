import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig: winston.LoggerOptions = {
  level: 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('SILAKAP', {
          prettyPrint: true,
        }),
      ),
    }),
  ],
};

import { transports, format } from 'winston';

export const securityLogger = {
  provide: 'WINSTON_SECURITY_LOGGER',
  useFactory: () => {
    return require('winston').createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.json(),
      ),
      transports: [
        new transports.File({
          filename: 'logs/security.log',
          maxsize: 5_000_000,
          maxFiles: 5,
        }),
      ],
    });
  },
};
