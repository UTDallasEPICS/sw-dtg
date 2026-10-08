export default defineEventHandler(() => {
  while (true) {
    const gameCode = Math.floor(100000 + Math.random() * 900000).toString()
    if (!activeRooms.has(gameCode)) {
      activeRooms.set(gameCode, {
        pin: gameCode,
        createdAt: Date.now(),
        status: 'LOBBY',
        players: [],
      })

      return { gameCode }
    }
  }
})
