<script setup>
  import { ref, onMounted } from 'vue'
  const route = useRoute()
  const pin = route.query.pin // Reads the forwarded PIN
  const players = ref([])

  // const {$socket} = useNuxtApp()
  onMounted(() => {
    console.log('Lobby page mounted with PIN:', pin)
  })

  //Socket.io host registration:

  //$scoket.emit('register', { pin: pin })
  //$socket.on('Player_Joined', () => {
  // players.value = updatePlayersList() // Update the players list when a new player joins
  // })

  onUnmounted(() => {
    console.log('Lobby page unmounted')
    // $socket.off('Player_Joined') // Clean up the event listener when the component is unmounted
  })

  function startGame() {
    //$socket.emit('Start_Game', { pin: pin })
    // navigateTo('.. have info stuff')
    console.log('Start game emitted for PIN:', pin)
  }
</script>

<template>
  <div class="screen-container">
    <!-- Fixed Header (Optional) -->
    <!-- <header class="screen-header"></header> -->

    <div>
      <p v-if="pin" class="size">
        Room PIN: <strong>{{ pin }}</strong>
      </p>
    </div>

    <!-- Scrollable Div -->
    <div v-if="players.length === 0" class="empty-state">Waiting for players to join...</div>
    <ul class="player-grid">
      <li v-for="player in players" :key="player.id" class="player-pill">
        {{ player.name }}
      </li>
    </ul>
    <NuxtLink :to="`/game?pin=${pin}`">
      <button @click="startGame">StartGame</button>
    </NuxtLink>
  </div>
</template>

<style scoped>
  .screen-container {
    display: flex;
    flex-direction: column;
    height: 100vh; /* Full screen height */
    max-height: 100vh;
    overflow: hidden; /* Prevents the whole page from scrolling */
  }

  /* .screen-header {
    padding: 1rem;
    background: #f0f0f0;
  } */

  .scrollable-content {
    font-size: 2vw;
    flex-grow: 1; /* Takes up remaining vertical space */
    overflow-y: auto; /* Enables vertical scrolling */
    padding: 0.25rem;
    margin-top: -40vh;
    display: flex;
    flex-direction: column;
    justify-content: center; /* Aligns items to the top */
    align-items: center; /* Centers items horizontally */
    gap: 1rem; /* Space between items */
    justify-content: center;
  }
</style>
