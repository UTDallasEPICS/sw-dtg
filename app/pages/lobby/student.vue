<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import type { Socket } from 'socket.io-client'

  // Access the client socket injected via app/plugins/socket.client.ts
  const { $socket } = useNuxtApp() as unknown as { $socket: Socket }

  // Shape consistent with server/utils/rooms.ts
  interface Player {
    id: string
    name: string
    cardsRead: number
  }

  const route = useRoute()
  const pin = ref((route.query.pin as string) || '')
  const nickname = ref((route.query.name as string) || '')

  const players = ref<Player[]>([])
  const joined = ref(false)
  const errorMessage = ref('')

  // Join the game room when student submits their name and PIN
  function joinRoom(): void {
    if (!pin.value || !nickname.value.trim()) {
      errorMessage.value = 'Please provide both a room PIN and a nickname.'
      return
    }

    errorMessage.value = ''
    // Emit PLAYER_JOIN to match server/plugins/socket.io.ts handler
    $socket.emit('PLAYER_JOIN', {
      pin: pin.value.trim(),
      name: nickname.value.trim(),
    })
  }

  onMounted(() => {
    // 1. Success confirmation from server
    $socket.on('JOIN_SUCCESS', (data: { player: Player; pin: string }) => {
      joined.value = true
      errorMessage.value = ''
      console.log('[Student] Successfully joined room:', data.pin)
    })

    // 2. Validation error response from server (invalid PIN, game started, duplicate name)
    $socket.on('JOIN_ERROR', (data: { message: string }) => {
      errorMessage.value = data.message
      console.warn('[Student] Join error:', data.message)
    })

    // 3. Keep roster updated whenever other players join or leave
    $socket.on('ROSTER_UPDATE', (updatedPlayers: Player[]) => {
      players.value = updatedPlayers
    })

    // 4. Server broadcasts GAME_STARTED when teacher starts the match
    $socket.on('GAME_STARTED', () => {
      navigateTo(`/gamepage?pin=${pin.value}`)
    })

    // Auto-join if PIN and nickname were passed via query parameters
    if (pin.value && nickname.value) {
      joinRoom()
    }
  })

  // Clean up listeners when navigating away
  onUnmounted(() => {
    $socket.off('JOIN_SUCCESS')
    $socket.off('JOIN_ERROR')
    $socket.off('ROSTER_UPDATE')
    $socket.off('GAME_STARTED')
  })
</script>

<template>
  <div class="screen-container">
    <div class="lobby-card">
      <h2>Student Lobby</h2>

      <!-- Join Form if not yet joined -->
      <div v-if="!joined" class="join-form">
        <label for="pin">Room PIN:</label>
        <input id="pin" v-model="pin" placeholder="e.g. 123456" />

        <label for="nickname">Your Nickname:</label>
        <input id="nickname" v-model="nickname" placeholder="Enter nickname" />

        <button class="join-btn" @click="joinRoom">Join Game</button>
      </div>

      <!-- In-Lobby Waiting View -->
      <div v-else class="waiting-view">
        <p class="pin-display">
          Room PIN: <strong>{{ pin }}</strong>
        </p>
        <p class="status-msg">You're in! Waiting for teacher to start the game...</p>

        <h3>Players in Room:</h3>
        <ul class="player-grid">
          <li v-for="player in players" :key="player.id" class="player-pill">
            {{ player.name }}
          </li>
        </ul>
      </div>

      <!-- Feedback / Error messages -->
      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<style scoped>
  .screen-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 1.5rem;
  }

  .lobby-card {
    width: 100%;
    max-width: 450px;
    background: #fff;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  }

  .join-form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .join-form input {
    padding: 0.6rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
  }

  .join-btn {
    margin-top: 0.5rem;
    padding: 0.75rem;
    background-color: #2563eb;
    color: white;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .waiting-view {
    margin-top: 1rem;
  }

  .error-text {
    color: #dc2626;
    margin-top: 1rem;
    font-weight: 500;
  }

  .player-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.75rem;
    padding: 0;
    list-style: none;
  }

  .player-pill {
    background-color: #e2e8f0;
    padding: 0.4rem 0.8rem;
    border-radius: 9999px;
    font-size: 0.9rem;
  }
</style>
