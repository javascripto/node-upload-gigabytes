import url from 'url'

import {
  IncomingMessage as Request,
  ServerResponse as Response
} from 'http'
import { Server as SocketIo } from 'socket.io'

export default class Routes {
  constructor(private io: SocketIo) {}

  async post(request: Request, response: Response) {
    const { headers } = request
    const { query: { socketId } } = url.parse(request.url!, true)
    const redirectTo = headers.origin!

    this.io.to(socketId as string).emit('file-uploaded', 5e6)

    const onFinish = (response: Response, redirectTo: string) => {
      response.writeHead(303, {
        Connection: 'close',
        Location: `${redirectTo}?msg=Files uploaded with success!`
      })
      response.end()
    }

    return onFinish(response, redirectTo)
  }
}