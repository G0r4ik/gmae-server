import WebSocket, { WebSocketServer } from 'ws'
import { v4 as uuidv4 } from 'uuid'

const rooms = {}

// setInterval(() => {
//   console.log(rooms)
// }, 5000)

const wss = new WebSocketServer({ port: 5000 }, () =>
  console.log(`Server started on 5000`)
)

wss.on('connection', function connection(socket) {
  const uuid = uuidv4()
  const leave = room => {
    if (!rooms[room][uuid]) return

    if (Object.keys(rooms[room]).length === 1) delete rooms[room]
    else delete rooms[room][uuid]
  }

  socket.on('message', function (data) {
    const { message, meta, room, user } = JSON.parse(data)
    socket.user = user

    if (meta === 'join') {
      if (!rooms[room]) {
        return socket.send(
          JSON.stringify({ message: 'Такого лобби не существует' })
        )
      }
      if (!rooms[room][uuid]) rooms[room][uuid] = socket
      const users = []
      for (const sock of Object.values(rooms[room])) users.push(sock.user)

      Object.entries(rooms[room]).forEach(([, sock]) =>
        sock.send(
          JSON.stringify({
            message,
            user: users,
            room: room,
            type: 'joinToLobby',
          })
        )
      )
    } else if (meta === 'createLobby') {
      if (!rooms[room]) rooms[room] = {}
      if (!rooms[room][uuid]) rooms[room][uuid] = socket
      Object.entries(rooms[room]).forEach(([, sock]) =>
        sock.send(JSON.stringify({ message, type: 'createLobby', user, room }))
      )
    } else if (meta === 'leave') {
      leave(room)
    } else if (meta === 'startGame') {
      Object.entries(rooms[room]).forEach(([, sock]) =>
        sock.send(JSON.stringify({ message, type: 'startGame' }))
      )
    } else if (!meta) {
      Object.entries(rooms[room]).forEach(([, sock]) =>
        sock.send(JSON.stringify({ message }))
      )
    } else if (meta === 'move') {
      Object.entries(rooms[room]).forEach(([, sock]) =>
        sock.send(JSON.stringify(JSON.parse(data)))
      )
    }

    //   message = JSON.parse(message)
    //   switch (message.event) {
    //     case 'message':
    //       broadcastMessage(message)
    //       break
    //     case 'connection':
    //       broadcastMessage(message)
    //       break
    //   }
  })
  socket.on('close', () => {
    // for each room, remove the closed socket
    Object.keys(rooms).forEach(room => leave(room))
  })
})

function broadcastMessage(message, id) {
  wss.clients.forEach(client => {
    client.send(JSON.stringify(message))
  })
}
