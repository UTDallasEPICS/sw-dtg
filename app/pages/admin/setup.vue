<template>
  <div class="app-layout">
    <header class="app-header">
      <h1 class="text-center">Set up Page</h1>
    </header>

    <main class="app-content">
      <div class="game-pin-display">
        <p class="label">Game Room Code:</p>

        <!-- Displayed generated PIN -->
        <h1 class="display-gen-code">{{ gamePin }}</h1>

        <!-- Error fallback -->
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </div>

      <div class="deck-section">
        <p class="label">Choose a Deck</p>
        <div class="custom-deck-box">
          <!-- Deck selection components will go here -->
        </div>
      </div>

      <div class="start-game-section">
        <button class="start-game-button">Start Session</button>
      </div>
    </main>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'

  const gamePin = ref('')
  const errorMessage = ref('')

  async function generateGamePin() {
    errorMessage.value = ''

    try {
      const data = await $fetch('/api/rooms/gamepin', {
        method: 'POST',
      })

      // Fallback to whichever property name the server returns (gameCode or pin)
      gamePin.value = data.gameCode || data.pin
      console.log('Active Room PIN:', gamePin.value)
    } catch (err) {
      errorMessage.value = 'Failed to generate PIN. Please refresh the page.'
      console.error('Error creating game pin:', err)
    } finally {
      // Any cleanup or final steps can go here
    }
  }

  // Automatically runs as soon as the teacher accesses this page
  onMounted(() => {
    generateGamePin()
  })
</script>

<style scoped>
  /* Responsive layout CSS */
  .app-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  .app-content {
    width: 100%;
    margin: 0 auto;
    padding: 1.5rem;
  }
  .custom-deck-box {
    width: 100%;
    height: 40vh;
    background-color: #e0e0e0;
    border-radius: 8px;
    margin-bottom: 1rem;
  }
  .game-pin-display {
    padding-top: 5rem;
  }
  .start-game-section {
    display: flex;
    justify-content: center;
    border-top: 1px solid #ccc;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
    border-radius: 8px;
    margin-top: 2rem;
  }
</style>
