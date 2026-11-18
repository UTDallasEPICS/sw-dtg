import type { Server as HTTPServer } from 'node:http'
import type { Socket as NetSocket } from 'node:net'
import { Server as SocketIOServer } from 'socket.io'
import type { NitroApp } from 'nitropack'

// Interface to satisfy strict linter checks without using 'any'
interface ExtendedSocketServer extends HTTPServer {
  io?: SocketIOServer
}

interface SocketWithServer extends NetSocket {
  server?: ExtendedSocketServer
}

export default defineNitroPlugin((nitroApp: NitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const nodeRes = event.node.res
    const socket = nodeRes.socket as SocketWithServer | undefined
    const server = socket?.server

    if (!server || server.io) return

    const io = new SocketIOServer(server, {
      path: '/socket.io/',
      cors: { origin: '*', methods: ['GET', 'POST'] },
    })

    server.io = io

    io.on('connection', (socket) => {
      // 1. Host registration
      socket.on('REGISTER_HOST', ({ pin }) => {
        const room = activeRooms.get(pin)
        if (!room) return
        room.hostSocketId = socket.id
        socket.join(pin)
        socket.emit('ROSTER_UPDATE', room.players)
      })

      // 2. Student join / channel subscription
      socket.on('PLAYER_JOIN', ({ pin, name }: { pin: string; name: string }) => {
        const room = activeRooms.get(pin)

        // Validation: room exists
        if (!room) {
          socket.emit('JOIN_ERROR', { message: 'Invalid room PIN.' })
          return
        }

        // If game is already started, don't allow new joins
        if (room.status !== 'LOBBY') {
          socket.emit('JOIN_ERROR', { message: 'Game is already in progress.' })
          return
        }

        const trimmedName = (name || '').trim().slice(0, 30)
        if (!trimmedName) {
          socket.emit('JOIN_ERROR', { message: 'Nickname cannot be empty.' })
          return
        }

        // Always put the student's socket into the Socket.io room channel!
        socket.join(pin)

        // Check if student was already registered via HTTP POST /api/rooms/:pin/players
        const existingPlayer = room.players.find(
          (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
        )

        let playerObj: Player

        if (existingPlayer) {
          // Update socket ID on existing player record
          existingPlayer.id = socket.id
          playerObj = existingPlayer
        } else {
          // If joined directly via socket without prior HTTP POST
          playerObj = {
            id: socket.id,
            name: trimmedName,
            cardsRead: 0,
          }
          room.players.push(playerObj)
        }

        // Confirm join to student device
        socket.emit('JOIN_SUCCESS', {
          player: playerObj,
          pin,
        })

        // Broadcast updated Player[] array to host projector and all connected room sockets
        io.to(pin).emit('ROSTER_UPDATE', room.players)
      })

      // 3. Start game (only authorized host can trigger)
      socket.on('START_GAME', ({ pin }) => {
        const room = activeRooms.get(pin)

        if (!room) {
          socket.emit('ERROR', { message: 'Room not found.' })
          return
        }
        if (room.hostSocketId !== socket.id) {
          socket.emit('ERROR', { message: 'Only the host can start the game' })
          return
        }

        room.status = 'PLAYING'
        room.currentPlayer = 0

        // Broadcast to ALL sockets in the room (host AND all students)
        io.to(pin).emit('GAME_STARTED', {
          pin,
          players: room.players,
          currentTurnIndex: room.currentPlayer,
          activePlayer: room.players[0],
        })
      })

      // 4. Socket disconnection cleanup
      socket.on('disconnect', () => {
        for (const [pin, room] of activeRooms.entries()) {
          const index = room.players.findIndex((p) => p.id === socket.id)
          if (index !== -1) {
            room.players.splice(index, 1)
            io.to(pin).emit('ROSTER_UPDATE', room.players)
            break
          }
        }
      })
    })
  })
})
