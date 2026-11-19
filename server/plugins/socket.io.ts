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
        room.hasSpunThisTurn = false
        room.isSpinning = false

        // Broadcast to ALL sockets in the room (host AND all students)
        io.to(pin).emit('GAME_STARTED', {
          pin,
          players: room.players,
          currentTurnIndex: room.currentPlayer,
          activePlayer: room.players[0],
        })
      })
      
      // 4. Player requests to spin
      socket.on('SPIN_REQUEST', ({ pin }) => {
        const room = activeRooms.get(pin)

        // Check if room exists
        if (!room) {
          socket.emit('SPIN_ERROR', {
            message: 'Room not found.'
          })
          return
        }

        // Check if game has started
        if (room.status !== 'PLAYING') {
          socket.emit('SPIN_ERROR', {
            message: 'The game has not started.'
          })
          return
        }

        // Find which player sent the request
        const playerIndex = room.players.findIndex(
          (player) => player.id === socket.id
        )

        // Check if the socket belongs to a player
        if (playerIndex === -1) {
          socket.emit('SPIN_ERROR', {
            message: 'You are not a player in this game.'
          })
          return
        }

        // Check whose turn it is
        if (playerIndex !== room.currentPlayer) {
          socket.emit('SPIN_ERROR', {
            message: 'It is not your turn!'
          })
          return
        }

        // Prevent multiple spins
        if (room.hasSpunThisTurn || room.isSpinning) {
          socket.emit('SPIN_ERROR', {
            message: 'You have already spun this turn.'
          })
          return
        }

        // Lock the spin
        room.isSpinning = true
        room.hasSpunThisTurn = true

        // Choose a random color on the SERVER
        const colors = ['blue', 'yellow', 'red', 'purple'] as const

        const color = colors[Math.floor(Math.random() * colors.length)]!

        // Send the result to everyone in the room
        io.to(pin).emit('SPIN_RESULT', {
          color,
          player: room.players[playerIndex]!.name
        })

        // Unlock after 2 seconds
        setTimeout(() => {
          room.isSpinning = false
        }, 2000)
      })

      // 4. Socket disconnection cleanup
      socket.on('disconnect', () => {
        for (const [pin, room] of activeRooms.entries()) {
          // If in lobby, remove player from list
          if (room.status === 'LOBBY') {
            const index = room.players.findIndex((p) => p.id === socket.id)
            if (index !== -1) {
              room.players.splice(index, 1)
              io.to(pin).emit('ROSTER_UPDATE', room.players)
              break
            }
          }
        }
      })

      // 5. Player ends their turn
      socket.on('END_TURN', ({ pin }) => {
        const room = activeRooms.get(pin)

        if (!room || room.status !== 'PLAYING') {
          return
        }

        const playerIndex = room.players.findIndex(
          (player) => player.id === socket.id
        )

        const isHost = room.hostSocketId === socket.id

        // Allow active player or host to end turn
        if (!isHost && playerIndex !== room.currentPlayer) {
          socket.emit('ERROR', {
            message: 'It is not your turn.'
          })
          return
        }

        // They must have spun first (host can bypass if player is unresponsive)
        if (!isHost && (!room.hasSpunThisTurn || room.isSpinning)) {
          socket.emit('ERROR', {
            message: 'You must spin before ending your turn.'
          })
          return
        }

        // Move to the next player
        room.currentPlayer =
          ((room.currentPlayer ?? 0) + 1) % room.players.length

        room.hasSpunThisTurn = false
        room.isSpinning = false

        // Tell everyone whose turn it is now
        io.to(pin).emit('TURN_UPDATE', {
          currentTurnIndex: room.currentPlayer,
          activePlayer: room.players[room.currentPlayer]
        })
      })

      socket.on('RECONNECT_PLAYER', ({ pin, name }: { pin: string; name?: string }) => {
        const room = activeRooms.get(pin)
        if (!room) return

        socket.join(pin)

        if (name) {
          const player = room.players.find(
            (p) => p.name.toLowerCase() === name.trim().toLowerCase()
          )
          if (player) {
            player.id = socket.id
          }
        }

        socket.emit('GAME_STATE', {
          pin,
          players: room.players,
          currentTurnIndex: room.currentPlayer ?? 0,
          status: room.status
        })
      })

      socket.on('GET_GAME_STATE', ({ pin, name }: { pin: string; name?: string }) => {
        const room = activeRooms.get(pin)

        if (!room) {
          socket.emit('ERROR', {
            message: 'Room not found.'
          })
          return
        }

        socket.join(pin)

        if (name) {
          const player = room.players.find(
            (p) => p.name.toLowerCase() === name.trim().toLowerCase()
          )
          if (player) {
            player.id = socket.id
          }
        }

        socket.emit('GAME_STATE', {
          pin,
          players: room.players,
          currentTurnIndex: room.currentPlayer ?? 0,
          status: room.status
        })
      })
    })
  })


})

