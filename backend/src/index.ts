import http, {
  IncomingMessage as Request,
  ServerResponse as Response,
} from 'http';
import { AddressInfo } from 'net';
import { Server as SocketIo } from 'socket.io';

import { logger } from './util';

import Routes from './routes';

const PORT = 3000;

const handler = (request: Request, response: Response) => {
  const defaultRoute = async (request: Request, response: Response) =>
    response.end('Hello\n');

  const routes = new Routes(io);
  const method = (request.method?.toLocaleLowerCase() || '') as 'post';
  const chosen = routes[method] || defaultRoute;

  return chosen.apply(routes, [request, response]);
};

const server = http.createServer(handler);

const io = new SocketIo(server, {
  cors: {
    origin: '*',
    credentials: false,
  },
});

io.on('connection', (socket) => logger.info('someone connected', socket.id));

const onServerInit = () => {
  const { address, port } = server.address() as AddressInfo;
  console.log(`app running at http://${address}:${port}`);
};

server.listen(PORT, onServerInit);
