import { io, type Socket } from 'socket.io-client'

export default defineNuxtPlugin(() => {
  // Initialize the Socket.io client connection to our Nitro server.
  // We explicitly match the server plugin path ('/socket.io/').
  const socket: Socket = io({
    path: '/socket.io/',
    autoConnect: true,
    transports: ['websocket', 'polling'],
  })

  socket.on('connect_error', (err) => {
    console.error('[Socket.io] Connection Error because: ', err.message)
  })

  socket.on('disconnect', (reason) => {
    console.warn('[Socket.io] Disconnected because: ', reason)
  })

  socket.on('connect', () => {
    console.log('[Socket.io] Connected to the server with ID:', socket.id)
  })

  // Expose $socket globally to the Nuxt runtime app instance
  return {
    provide: {
      socket,
    },
  }
})
