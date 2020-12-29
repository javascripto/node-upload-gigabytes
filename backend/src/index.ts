import http, {
  IncomingMessage as Request,
  ServerResponse as Response
} from 'http'
import { AddressInfo } from 'net'
import { Server as SocketIo } from 'socket.io'

const PORT = 3000

const handler = (request: Request, response: Response) => {
  const defaultRoute = async (request: Request, response: Response) => (
    response.end('Hello\n')
  )

  return defaultRoute(request, response)
}

const server = http.createServer(handler)

const io = new SocketIo(server, {
  cors: {
    origin: '*',
    credentials: false,
  },
})

io.on('connection', socket => console.log('someone connected', socket.id))
io.emit('file-upload')

const onServerInit = () => {
  const { address, port } = server.address() as AddressInfo
  console.log(`app running at http://${address}:${port}`)
}

server.listen(PORT, onServerInit)
