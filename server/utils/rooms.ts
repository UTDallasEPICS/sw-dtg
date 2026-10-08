// server/utils/rooms.ts
export interface GameRoom {
  pin: string
  createdAt: number
  status: 'LOBBY' | 'PLAYING' | 'FINISHED'
  players: string[]
}

// Single active rooms registry in server RAM
export const activeRooms = new Map<string, GameRoom>()
