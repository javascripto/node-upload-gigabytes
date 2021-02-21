import url from 'url';

import { IncomingMessage as Request, ServerResponse as Response } from 'http';
import { Server as SocketIo } from 'socket.io';

import UploadHandler from './UploadHandler';
import { logger, pipelineAsync } from './util';

export default class Routes {
  constructor(private io: SocketIo) {}

  async post(request: Request, response: Response) {
    const { headers } = request;
    const {
      query: { socketId },
    } = url.parse(request.url!, true);
    const redirectTo = headers.origin!;

    const uploadHandler = new UploadHandler(this.io, socketId as string);

    function onFinish(response: Response, redirectTo: string) {
      return () => {
        response.writeHead(303, {
          Connection: 'close',
          Location: `${redirectTo}?msg=Files uploaded with success!`,
        });
        response.end();
      };
    }

    const busboyInstance = uploadHandler.registerEvents(
      headers,
      onFinish(response, redirectTo)
    );

    await pipelineAsync(request, busboyInstance);

    logger.info('Request finished with success!');
  }
}
