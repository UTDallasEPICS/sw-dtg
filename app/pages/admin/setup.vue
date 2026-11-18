<template>
  <main class="setup-container">
    <!-- Header: Title centered at top -->
    <header class="header-section">
      <h1 class="game-title">Stronger Twister</h1>
    </header>

    <!-- Center Section: Game PIN pill with offset shadow -->
    <section class="pin-section">
      <div class="pin-pill-box">
        <span class="pin-label">Game Pin</span>
        <div class="pin-value">
          <span v-if="gamePin">{{ gamePin }}</span>
          <span v-else class="pin-placeholder">Generating...</span>
        </div>
      </div>

      <!-- Error feedback if room generation fails -->
      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    </section>

    <!-- Action Section: Start Session Button -->
    <footer class="action-section">
      <NuxtLink :to="`/lobby?pin=${gamePin}`" class="start-session-link">
        <button class="start-session-btn" :disabled="!gamePin">Start Session!</button>
      </NuxtLink>
    </footer>
  </main>
</template>

<script setup>
  import { ref, onMounted } from 'vue'

  // Reactive state for room PIN and any network errors
  const gamePin = ref('')
  const errorMessage = ref('')

  // Generates a 6-digit game PIN from the backend API
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
    }
  }

  // Automatically request PIN when teacher enters this page
  onMounted(() => {
    generateGamePin()
  })
</script>

<style scoped>
  /* ==========================================================================
     1. Full-Screen Page Container
     Pure full-screen butter yellow (#fffbd6) on both mobile and desktop.
     No nested card box, no border fluff.
     ========================================================================== */
  .setup-container {
    width: 100vw;
    min-height: 100vh;
    background-color: #fffbd6; /* Exact signature butter yellow */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 3.5rem 1.5rem 3rem 1.5rem;
    box-sizing: border-box;
  }

  /* ==========================================================================
     2. Header & Title
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
     3. Center PIN Section & Offset Shadow Pill
     ========================================================================== */
  .pin-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: auto 0; /* Vertically centers the pill in the open space */
  }

  /* White pill with bold offset black shadow matching Figma mock */
  .pin-pill-box {
    width: 100%;
    max-width: 280px;
    background-color: #ffffff;
    border-radius: 9999px;
    padding: 1.35rem 1.25rem;
    text-align: center;
    box-shadow: 12px 10px 0px #1a1a1a;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
  }

  .pin-label {
    font-size: 1.75rem;
    font-weight: 800;
    color: #111111;
    letter-spacing: -0.3px;
  }

  .pin-value {
    font-size: 2rem;
    font-weight: 900;
    color: #1e3a8a; /* Deep bold blue for clear room code readability */
    letter-spacing: 3px;
  }

  .pin-placeholder {
    font-size: 1.1rem;
    font-weight: 600;
    color: #888888;
    letter-spacing: normal;
  }

  .error-text {
    color: #dc2626;
    font-weight: 600;
    font-size: 0.95rem;
    text-align: center;
    margin-top: 1.25rem;
  }

  /* ==========================================================================
     4. Footer Action Button Section
     ========================================================================== */
  .action-section {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .start-session-link {
    width: 100%;
    max-width: 290px;
    display: flex;
    text-decoration: none;
  }

  .start-session-btn {
    width: 100%;
    background-color: #ffffff;
    color: #111111;
    font-size: 1.85rem;
    font-weight: 800;
    padding: 1.1rem 1.5rem;
    border-radius: 26px;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease,
      background-color 0.15s ease;
    text-align: center;
  }

  .start-session-btn:hover:not(:disabled) {
    background-color: #fafafa;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }

  .start-session-btn:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  .start-session-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* ==========================================================================
     5. Desktop View (min-width: 768px)
     Stays completely full screen (no card wrapper/borders) with refined scale
     ========================================================================== */
  @media (min-width: 768px) {
    .setup-container {
      padding: 4.5rem 2rem 4rem 2rem;
    }

    .game-title {
      font-size: 3rem;
    }

    .pin-pill-box {
      max-width: 320px;
      padding: 1.5rem 1.75rem;
      box-shadow: 14px 12px 0px #1a1a1a;
    }

    .pin-label {
      font-size: 2rem;
    }

    .pin-value {
      font-size: 2.4rem;
    }

    .start-session-link {
      max-width: 320px;
    }

    .start-session-btn {
      font-size: 2.1rem;
      padding: 1.25rem 2rem;
      border-radius: 28px;
    }
  }
</style>
