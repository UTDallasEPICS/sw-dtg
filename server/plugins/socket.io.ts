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
      socket.on('REGISTER_HOST', ({ pin }) => {
        const room = activeRooms.get(pin)
        if (!room) return
        room.hostSocketId = socket.id
        socket.join(pin)
        socket.emit('ROSTER_UPDATE', room.players)
      })

      socket.on('PLAYER_JOIN', ({ pin, name }: { pin: string; name: string }) => {
        const room = activeRooms.get(pin)

        // Validation: room exists and is still in lobby phase
        if (!room) {
          socket.emit('JOIN_ERROR', { message: 'Invalid room PIN.' })
          return
        }

        if (room.status !== 'LOBBY') {
          socket.emit('JOIN_ERROR', { message: 'Game is already in progress.' })
          return
        }

        const trimmedName = (name || '').trim().slice(0, 15)
        if (!trimmedName) {
          socket.emit('JOIN_ERROR', { message: 'Nickname cannot be empty.' })
          return
        }

        // Prevent duplicate names in the same classroom room
        const nameExists = room.players.some(
          (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
        )
        if (nameExists) {
          socket.emit('JOIN_ERROR', { message: 'Nickname is already taken.' })
          return
        }

        // Create player object matching the Player interface
        const newPlayer: Player = {
          id: socket.id,
          name: trimmedName,
          cardsRead: 0,
        }

        // Push player object, join the room channel, and broadcast
        room.players.push(newPlayer)
        socket.join(pin)

        // Confirm join to student device
        socket.emit('JOIN_SUCCESS', {
          player: newPlayer,
          pin,
        })

        // Broadcast updated Player[] array to host projector and all clients
        io.to(pin).emit('ROSTER_UPDATE', room.players)
      })

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

        io.to(pin).emit('GAME_STARTED', {
          pin,
          players: room.players,
          currentTurnIndex: room.currentPlayer,
          activePlayer: room.players[0],
        })
      })

      socket.on('disconnect', () => {
        for (const [pin, room] of activeRooms.entries()) {
          // Explicitly type p as Player to eliminate the 'string' mismatch
          console.log(typeof socket.id)
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
