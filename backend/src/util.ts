import pino from 'pino';
import { promisify } from 'util';
import { pipeline } from 'stream';

export { promisify } from 'util';
export const pipelineAsync = promisify(pipeline);

export const logger = pino({
  prettyPrint: {
    ignore: 'pid,hostname',
  },
});
