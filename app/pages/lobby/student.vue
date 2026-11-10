<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import type { Socket } from 'socket.io-client'

  // Access client socket instance injected by app/plugins/socket.client.ts
  const { $socket } = useNuxtApp() as unknown as { $socket: Socket }

  interface Player {
    id: string
    name: string
    cardsRead: number
  }

  const route = useRoute()
  const pin = ref((route.query.pin as string) || '')
  const nickname = ref((route.query.name as string) || '')
  const players = ref<Player[]>([])

  function setupSocket() {
    if (!pin.value || !nickname.value) return

    // Emit PLAYER_JOIN to register student's socket and join the room channel
    $socket.emit('PLAYER_JOIN', {
      pin: pin.value.trim(),
      name: nickname.value.trim(),
    })
  }

  onMounted(() => {
    // If student arrived without PIN or name, redirect to join page
    if (!pin.value || !nickname.value) {
      navigateTo('/player/join')
      return
    }

    // Connect this student's socket to the active room channel immediately
    setupSocket()

    // If socket reconnects, re-join the room channel
    $socket.on('connect', setupSocket)

    // Real-time roster updates as classmates join/leave
    $socket.on('ROSTER_UPDATE', (updatedPlayers: Player[]) => {
      players.value = updatedPlayers
    })

    // Navigate to active game when teacher starts session
    $socket.on('GAME_STARTED', () => {
      navigateTo(`/gamepage?pin=${pin.value}`)
    })
  })

  // Clean up listeners on unmount
  onUnmounted(() => {
    $socket.off('connect', setupSocket)
    $socket.off('ROSTER_UPDATE')
    $socket.off('GAME_STARTED')
  })
</script>

<template>
  <main class="student-lobby-container">
    <!-- Header: Game Title -->
    <header class="header-section">
      <h1 class="game-title">Stronger Twister</h1>
    </header>

    <!-- Center Section: Connected Student Pills -->
    <section class="students-section">
      <div class="students-list">
        <div v-for="player in players" :key="player.id" class="student-pill">
          <span class="student-name">{{ player.name }}</span>
        </div>
      </div>
    </section>

    <!-- Footer Card: "Welcome [name]" & "waiting for game to start" -->
    <footer class="status-section">
      <div class="waiting-card">
        <h2 class="welcome-name">Welcome {{ nickname }}!</h2>
        <p class="waiting-text">waiting for game to start</p>
      </div>
    </footer>
  </main>
</template>

<style scoped>
  /* ==========================================================================
     1. Full-Screen Page Container
     Edge-to-edge signature butter yellow (#fffbd6) with no border fluff
     ========================================================================== */
  .student-lobby-container {
    width: 100vw;
    min-height: 100vh;
    background-color: #fffbd6; /* Exact signature butter yellow */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 3rem 1.5rem 2.5rem 1.5rem;
    box-sizing: border-box;
  }

  /* ==========================================================================
     2. Header Section
     ========================================================================== */
  .header-section {
    width: 100%;
    text-align: center;
  }

  .game-title {
    font-size: 2.35rem;
    font-weight: 800;
    color: #111111;
    margin: 0;
    letter-spacing: -0.5px;
    line-height: 1.15;
  }

  /* ==========================================================================
     3. Students List Section
     Vertically stacked white capsule pills with lilac/purple text matching Figma
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

  .students-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.5rem 0;
  }

  /* White capsule pill matching the teacher lobby & mockup */
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

  /* Student name styled in gentle lilac/purple accent */
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
     4. Footer Section: "Welcome [name]" & "waiting for game to start"
     Rounded white card matching the mockup aesthetic
     ========================================================================== */
  .status-section {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .waiting-card {
    width: 100%;
    max-width: 300px;
    background-color: #ffffff;
    border-radius: 36px;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
  }

  /* Welcome name wraps cleanly or fits dynamically without overflowing */
  .welcome-name {
    font-size: clamp(1.35rem, 5vw, 1.85rem);
    font-weight: 800;
    color: #111111;
    margin: 0;
    line-height: 1.25;
    letter-spacing: -0.3px;
    word-break: break-word;
    overflow-wrap: anywhere;
    max-width: 100%;
  }

  /* Smaller subtitle below the name */
  .waiting-text {
    font-size: 1rem;
    font-weight: 600;
    color: #6b7280;
    margin: 0.6rem 0 0 0;
    letter-spacing: -0.2px;
  }

  /* ==========================================================================
     5. Desktop View (min-width: 768px)
     Full-screen canvas with proportional scaling
     ========================================================================== */
  @media (min-width: 768px) {
    .student-lobby-container {
      padding: 4rem 2rem 3.5rem 2rem;
    }

    .game-title {
      font-size: 3rem;
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

    .waiting-card {
      max-width: 350px;
      padding: 2.5rem 2rem;
      border-radius: 40px;
    }

    .welcome-name {
      font-size: clamp(1.6rem, 3.5vw, 2.2rem);
    }

    .waiting-text {
      font-size: 1.15rem;
      margin-top: 0.75rem;
    }
  }
</style>
