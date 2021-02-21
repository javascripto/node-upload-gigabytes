import Busboy from 'busboy';
import { join } from 'path';
import { createWriteStream } from 'fs';
import { Server as SocketIo } from 'socket.io';
import {
  IncomingMessage as Request,
  ServerResponse as Response,
  IncomingHttpHeaders as Headers,
} from 'http';

import { logger, pipelineAsync } from './util';

const ON_UPLOAD_EVENT = 'file-uploaded';

export default class UploadHandler {
  constructor(private io: SocketIo, private socketId: string) {
    this.onFile = this.onFile.bind(this);
    this.handleFileBytes = this.handleFileBytes.bind(this);
  }

  async options(request: Request, response: Response) {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST',
    });
    response.end();
  }

  registerEvents(headers: Headers, onFinish: Function) {
    const busboy = new Busboy({ headers });
    busboy.on('file', this.onFile);
    busboy.on('finish', onFinish);
    return busboy;
  }

  private async onFile(
    fieldname: string,
    file: NodeJS.ReadableStream /* FileStream */,
    filename: string
  ) {
    const saveFileTo = join(__dirname, '..', 'downloads', filename);
    logger.info(`Uploading ${saveFileTo}`);
    await pipelineAsync(
      file,
      this.handleFileBytes(filename),
      createWriteStream(saveFileTo)
    );
    logger.info(`File [${filename}] finished!`);
  }

  private handleFileBytes(filename: string) {
    const { socketId, io } = this;
    async function* handleData(data: NodeJS.ReadableStream /* FileStream */) {
      for await (const item /* Buffer */ of data) {
        const size = item.length;
        // logger.info(`File [${filename}] got ${size} bytes to ${socketId}`);
        io.to(socketId).emit(ON_UPLOAD_EVENT, size);
        yield item;
      }
    }
    return (handleData as any) as NodeJS.ReadWriteStream;
  }
}
