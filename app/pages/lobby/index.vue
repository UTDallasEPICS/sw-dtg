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
      navigateTo('/admin/setup')
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
  <main class="lobby-container">
    <!-- Header: Title & Room PIN -->
    <header class="header-section">
      <h1 class="game-title">Stronger Twister</h1>
      <p v-if="pin" class="pin-badge">
        Room PIN: <strong>{{ pin }}</strong>
      </p>
    </header>

    <!-- Center Section: Dynamic list of student pills -->
    <section class="students-section">
      <!-- Empty state when no students have joined yet -->
      <div v-if="players.length === 0" class="empty-state">
        <p>Waiting for players to join...</p>
      </div>

      <!-- Scrollable list of joined students -->
      <div v-else class="students-list">
        <div v-for="player in players" :key="player.id" class="student-pill">
          <span class="student-name">{{ player.name }}</span>
        </div>
      </div>
    </section>

    <!-- Footer Action: Start Game Button -->
    <footer class="action-section">
      <button class="start-game-btn" :disabled="players.length === 0" @click="startGame">
        Start game!
      </button>
    </footer>
  </main>
</template>

<style scoped>
  /* ==========================================================================
     1. Full-Screen Page Container
     Edge-to-edge butter yellow (#fffbd6) with no border fluff
     ========================================================================== */
  .lobby-container {
    width: 100vw;
    min-height: 100vh;
    background-color: #fffbd6; /* Signature butter yellow */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 3rem 1.5rem 2.5rem 1.5rem;
    box-sizing: border-box;
  }

  /* ==========================================================================
     2. Header Section: Title & Optional PIN badge
     ========================================================================== */
  .header-section {
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .game-title {
    font-size: 2.35rem;
    font-weight: 800;
    color: #111111;
    margin: 0;
    letter-spacing: -0.5px;
    line-height: 1.15;
  }

  .pin-badge {
    margin: 0.25rem 0 0 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #4b5563;
  }

  .pin-badge strong {
    color: #1e3a8a;
    font-weight: 800;
    letter-spacing: 1px;
  }

  /* ==========================================================================
     3. Students List Section
     Vertically stacked white rounded bars with soft purple-tinted student names
     ========================================================================== */
  .students-section {
    width: 100%;
    max-width: 320px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 1.5rem 0;
    overflow-y: auto;
  }

  .empty-state {
    font-size: 1.1rem;
    color: #6b7280;
    font-weight: 600;
    text-align: center;
    padding: 2rem 1rem;
  }

  .students-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.5rem 0;
  }

  /* White capsule pill matching the reference design */
  .student-pill {
    width: 100%;
    background-color: #ffffff;
    border-radius: 9999px;
    padding: 0.95rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;
  }

  .student-pill:hover {
    transform: translateY(-1px);
    box-shadow: 0 5px 12px rgba(0, 0, 0, 0.08);
  }

  /* Student name styled in gentle indigo/purple matching the mockup */
  .student-name {
    font-size: 1.45rem;
    font-weight: 700;
    color: #7b78d4; /* Lilac/purple accent color from the mock */
    letter-spacing: -0.2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ==========================================================================
     4. Footer Action Button Section ("Start game!")
     Large rounded white button styled matching the design
     ========================================================================== */
  .action-section {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .start-game-btn {
    width: 100%;
    max-width: 290px;
    background-color: #ffffff;
    color: #111111;
    font-size: 2rem;
    font-weight: 800;
    padding: 1.75rem 1.5rem;
    border-radius: 36px;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease,
      background-color 0.15s ease;
    text-align: center;
  }

  .start-game-btn:hover:not(:disabled) {
    background-color: #fafafa;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }

  .start-game-btn:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  .start-game-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* ==========================================================================
     5. Desktop View (min-width: 768px)
     Maintains the edge-to-edge clean full-screen look with proportional sizing
     ========================================================================== */
  @media (min-width: 768px) {
    .lobby-container {
      padding: 4rem 2rem 3.5rem 2rem;
    }

    .game-title {
      font-size: 3rem;
    }

    .pin-badge {
      font-size: 1.25rem;
    }

    .students-section {
      max-width: 400px;
      margin: 2rem 0;
    }

    .student-pill {
      padding: 1.1rem 2rem;
    }

    .student-name {
      font-size: 1.65rem;
    }

    .start-game-btn {
      max-width: 340px;
      font-size: 2.25rem;
      padding: 2rem 1.75rem;
      border-radius: 40px;
    }
  }
</style>
