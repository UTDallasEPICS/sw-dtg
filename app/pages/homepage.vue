<script setup lang="ts">
  // Navigate teacher directly to session setup page
  function handleTeacherClick() {
    navigateTo('/admin/setup')
  }

  // Navigate student directly to game join page
  function handleStudentClick() {
    navigateTo('/player/join')
  }
</script>

<template>
  <main class="home-container">
    <!-- Header: Game Title -->
    <header class="header-section">
      <h1 class="game-title">Stronger Twister</h1>
    </header>

    <!-- Center Section: Role Selection Buttons (Teacher & Student) -->
    <section class="role-selection-section">
      <!-- Teacher Button -->
      <button class="role-card-btn" @click="handleTeacherClick">
        <span class="role-label">Teacher</span>
      </button>

      <!-- Student Button -->
      <button class="role-card-btn" @click="handleStudentClick">
        <span class="role-label">Student</span>
      </button>
    </section>
  </main>
</template>

<style scoped>
  /* ==========================================================================
     1. Full-Screen Page Container
     Pure full-screen butter yellow (#fffbd6) with no border fluff
     ========================================================================== */
  .home-container {
    width: 100vw;
    min-height: 100vh;
    background-color: #fffbd6; /* Exact signature butter yellow */
    display: flex;
    flex-direction: column;
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
     3. Role Selection Section & Buttons
     Two rounded square/rectangular cards stacked vertically with generous spacing
     ========================================================================== */
  .role-selection-section {
    width: 100%;
    max-width: 320px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 3.5rem; /* Generous vertical gap matching the mockup */
    margin: 2rem 0;
  }

  /* White card buttons with soft rounded corners and subtle shadow */
  .role-card-btn {
    width: 100%;
    max-width: 250px;
    height: 130px;
    background-color: #ffffff;
    border-radius: 28px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease,
      background-color 0.15s ease;
  }

  .role-card-btn:hover {
    background-color: #fafafa;
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .role-card-btn:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  /* Role label typography using the lilac/purple tint from the design */
  .role-label {
    font-size: 2.25rem;
    font-weight: 700;
    color: #7b78d4; /* Lilac/purple accent color matching Figma */
    letter-spacing: -0.3px;
  }

  /* ==========================================================================
     4. Desktop View (min-width: 768px)
     Full-screen canvas with proportional sizing and smooth interactive scaling
     ========================================================================== */
  @media (min-width: 768px) {
    .home-container {
      padding: 4.5rem 2rem 4rem 2rem;
    }

    .game-title {
      font-size: 3rem;
    }

    .role-selection-section {
      max-width: 400px;
      gap: 4rem;
    }

    .role-card-btn {
      max-width: 290px;
      height: 150px;
      border-radius: 32px;
    }

    .role-label {
      font-size: 2.6rem;
    }
  }
</style>
