// server/utils/rooms.ts
export interface Player {
  id: string
  name: string
  cardsRead: number
}

export interface GameRoom {
  pin: string
  hostSocketId: string | null
  createdAt: number
  status: 'LOBBY' | 'PLAYING' | 'FINISHED'
  players: Player[] // <-- Make sure this is Player[], NOT string[]
  currentPlayer?: number


 // Add these:
  hasSpunThisTurn?: boolean
  isSpinning?: boolean
}

export const activeRooms = new Map<string, GameRoom>()

