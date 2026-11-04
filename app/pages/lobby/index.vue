<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import type { Socket } from 'socket.io-client'

  // Access the client socket injected via app/plugins/socket.client.ts
  const { $socket } = useNuxtApp() as unknown as { $socket: Socket }

  // Ensure Player shape matches server/utils/rooms.ts definition (id, name, cardsRead)
  interface Player {
    id: string
    name: string
    cardsRead: number
  }

  const route = useRoute()
  const pin = ref((route.query.pin as string) || '')
  const players = ref<Player[]>([])

  // Emit START_GAME to the server. The server verifies host authorization and notifies everyone.
  function startGame(): void {
    if (!pin.value) return
    $socket.emit('START_GAME', { pin: pin.value })
  }

  onMounted(() => {
    // If no PIN was forwarded via query string, redirect back to session setup
    if (!pin.value) {
      navigateTo('/setup')
      return
    }

    // 1. Tell the server this socket is the host for this specific room PIN
    $socket.emit('REGISTER_HOST', { pin: pin.value })

    // 2. Listen for the real-time player list updates whenever players join/leave
    $socket.on('ROSTER_UPDATE', (updatedPlayers: Player[]) => {
      players.value = updatedPlayers
    })

    // 3. Listen for transition to game board once triggered and verified by backend
    $socket.on('GAME_STARTED', () => {
      navigateTo(`/gamepage?pin=${pin.value}`)
    })
  })

  // Prevent memory leaks and duplicate listeners on component re-mounts
  onUnmounted(() => {
    $socket.off('ROSTER_UPDATE')
    $socket.off('GAME_STARTED')
  })
</script>

<template>
  <div class="screen-container">
    <div>
      <p v-if="pin" class="size">
        Room PIN: <strong>{{ pin }}</strong>
      </p>
    </div>

    <!-- Empty state when no players have entered the room yet -->
    <div v-if="players.length === 0" class="empty-state">Waiting for players to join...</div>

    <!-- Real-time roster display -->
    <ul class="player-grid">
      <li v-for="player in players" :key="player.id" class="player-pill">
        {{ player.name }}
      </li>
    </ul>

    <!--
      Notice: We don't wrap this button in <NuxtLink> because navigation should only occur
      after the backend validates host authority and emits 'GAME_STARTED'.
    -->
    <button class="start-button" :disabled="players.length === 0" @click="startGame">
      Start Game
    </button>
  </div>
</template>

<style scoped>
  .screen-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-height: 100vh;
    overflow: hidden;
    padding: 1.5rem;
  }

  .start-button {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    border-radius: 8px;
    align-self: flex-start;
  }

  .start-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
