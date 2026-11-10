import { activeRooms, type Player } from '~~/server/utils/rooms'

const PIN_PATTERN = /^\d{6}$/
const MAX_NAME_LENGTH = 30

interface JoinBody {
  name?: unknown
}

/**
 * Register a student in an existing game room.
 *
 * This endpoint is intentionally public (see server/middleware/auth.ts) so
 * students can join without a teacher account. All room state is validated
 * here; the client never mutates the player list directly.
 */
export default defineEventHandler(async (event) => {
  const pin = getRouterParam(event, 'pin')

  if (!pin || !PIN_PATTERN.test(pin)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid game PIN',
      data: { code: 'INVALID_PIN' },
    })
  }

  const body = await readBody<JoinBody>(event).catch(() => null)

  if (!body || typeof body.name !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'A student name is required',
      data: { code: 'INVALID_NAME' },
    })
  }

  const name = body.name.trim()

  if (name.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A student name is required',
      data: { code: 'INVALID_NAME' },
    })
  }

  if (name.length > MAX_NAME_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `Student names must be ${MAX_NAME_LENGTH} characters or fewer`,
      data: { code: 'INVALID_NAME' },
    })
  }

  const room = activeRooms.get(pin)

  if (!room) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Game not found',
      data: { code: 'ROOM_NOT_FOUND' },
    })
  }

  if (room.status !== 'LOBBY') {
    throw createError({
      statusCode: 409,
      statusMessage: 'This game has already started or ended',
      data: { code: 'ROOM_CLOSED' },
    })
  }

  const duplicate = room.players.some((player) => player.name.toLowerCase() === name.toLowerCase())

  if (duplicate) {
    throw createError({
      statusCode: 409,
      statusMessage: 'That name is already in use in this game',
      data: { code: 'DUPLICATE_NAME' },
    })
  }

  const newPlayer: Player = {
    id: crypto.randomUUID(),
    name,
    cardsRead: 0,
  }

  room.players.push(newPlayer)

  // Notify all connected sockets in this room (such as the teacher's lobby) that a player joined
  const socket = event.node.res.socket as unknown as {
    server?: { io?: import('socket.io').Server }
  }
  const io = socket?.server?.io
  if (io) {
    io.to(pin).emit('ROSTER_UPDATE', room.players)
  }

  setResponseStatus(event, 201)

  return {
    pin: room.pin,
    player: newPlayer,
    players: [...room.players],
  }
})
