<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import type { Socket } from 'socket.io-client'

  const route = useRoute()

  const cardClicked = ref(false)

  const pin = route.query.pin
  const roomPin = typeof pin === 'string' ? pin : pin?.[0]

  const players = ref<Player[]>([])
  const currentTurnIndex = ref(0)

  const isSpinning = ref(false)
  const selectedColor = useState<SpinnerColor | null>('selectedColor', () => null)

  const rotation = ref(0)
  const spinDuration = 2000

  type SpinnerColor = 'blue' | 'yellow' | 'red' | 'purple'

  interface Player {
    id: string
    name: string
    cardsRead: number
  }

  // Get your existing Socket.IO client
  const socket = useNuxtApp().$socket as Socket

  // Find whose turn it is
  const currentPlayer = computed(() => {
    return players.value[currentTurnIndex.value]
  })

  const isMyTurn = computed(() => {
    return currentPlayer.value?.id === socket.id
  })

  // Colors in the same order as the wheel
  const colors: SpinnerColor[] = ['blue', 'yellow', 'red', 'purple']

  // Server tells us which color was selected
  function handleSpinResult(data: { color: SpinnerColor; player: string }) {
    isSpinning.value = true
    selectedColor.value = data.color

    const index = colors.indexOf(data.color)

    // Center of the selected slice
    const sliceCenter = index * 90 + 45

    // Move the selected slice to the pointer
    const targetAngle = (360 - sliceCenter) % 360

    const currentAngle = rotation.value % 360

    const extraDegrees = (targetAngle - currentAngle + 360) % 360

    // Spin 4 full rotations plus the remaining angle
    rotation.value += 4 * 360 + extraDegrees

    setTimeout(() => {
      isSpinning.value = false
    }, spinDuration)
  }

  function handleDeckClick() {
    cardClicked.value = true
    navigateTo({
      path: '/Cards',
      query: { pin: roomPin },
    })
  }

  // Server updates whose turn it is
  function handleTurnUpdate(data: { currentTurnIndex: number; activePlayer: Player }) {
    currentTurnIndex.value = data.currentTurnIndex
    selectedColor.value = null
  } //here?

  // Game starts
  function handleGameStarted(data: { players: Player[]; currentTurnIndex: number }) {
    players.value = data.players
    currentTurnIndex.value = data.currentTurnIndex
  }

  // Server rejects an action
  function handleSpinError(data: { message: string }) {
    alert(data.message)
  }

  // Ask server to spin
  function spin() {
    if (isSpinning.value) return

    if (!isMyTurn.value) {
      alert('It is not your turn!')
      return
    }

    if (selectedColor.value) {
      alert('You have already spun this turn!')
      return
    }

    socket.emit('SPIN_REQUEST', {
      pin: roomPin,
    })
  }

  // End turn
  function endTurn() {
    if (!isMyTurn.value) return

    if (!selectedColor.value) {
      alert('You must spin first!')
      return
    }

    socket.emit('END_TURN', {
      pin: roomPin,
    })
  }

  onMounted(() => {
    socket.on('SPIN_RESULT', handleSpinResult)
    socket.on('TURN_UPDATE', handleTurnUpdate)
    socket.on('GAME_STARTED', handleGameStarted)
    socket.on('SPIN_ERROR', handleSpinError)
    socket.on('GAME_STATE', handleGameState)
    // Request the current game information
    socket.emit('GET_GAME_STATE', {
      pin: roomPin,
    })

    //console.log('PIN:', roomPin)
  })

  onUnmounted(() => {
    socket.off('SPIN_RESULT', handleSpinResult)
    socket.off('TURN_UPDATE', handleTurnUpdate)
    socket.off('GAME_STARTED', handleGameStarted)
    socket.off('SPIN_ERROR', handleSpinError)
    socket.off('GAME_STATE', handleGameState)
  })

  function handleGameState(data: { players: Player[]; currentTurnIndex: number }) {
    players.value = data.players
    currentTurnIndex.value = data.currentTurnIndex
  }
</script>

<template>
  <div class="game">
    <h1>Stronger Twister</h1>

    <h2 v-if="currentPlayer">{{ currentPlayer.name }}&#39;s Turn</h2>

    <p v-if="!isMyTurn">Waiting for the current player...</p>

    <div class="spin-card">
      <div class="spin-text">Spin</div>

      <div class="wheel-container">
        <div class="pointer" aria-hidden="true"></div>

        <!-- <button
          type="button"
          class="wheel"
          aria-label="Spin the wheel"
          :disabled="isSpinning"
          :style="{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: `${spinDuration}ms`,
          }"
          @click="spin"
        ></button> -->
        <button
          type="button"
          class="wheel"
          :disabled="!isMyTurn || isSpinning || selectedColor !== null"
          :style="{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: `${spinDuration}ms`,
          }"
          @click="spin"
        ></button>
      </div>
    </div>

    <!-- <p v-if="selectedColor">Selected color: {{ selectedColor }}</p>

    <button
      class="deck-button"
      :disabled="isSpinning || !selectedColor"
      @click="navigateTo('/Cards')"
    >
      Deck!
    </button> -->
    <p v-if="selectedColor">Selected color is: {{ selectedColor }}</p>

    <button
      v-if="!cardClicked"
      class="deck-button"
      :disabled="!isMyTurn || isSpinning || !selectedColor"
      @click="handleDeckClick"
    >
      Deck!
    </button>

    <button
      v-else
      class="deck-button"
      :disabled="!isMyTurn || isSpinning || !selectedColor"
      @click="endTurn"
    >
      End Turn!
    </button>
  </div>
</template>

<style>
  body {
    margin: 0;
    background-color: #f2f2f2;
    font-family: Arial, sans-serif;
  }

  .game {
    width: 300px;
    margin: 30px auto;
    padding: 10px;
    background-color: #fffbd6;
    border-radius: 20px;
    text-align: center;
  }

  h1 {
    font-size: 30px;
    margin: 0 0 25px 0;
  }

  /* White card */
  .spin-card {
    width: 170px;
    height: 280px;
    margin: 0 auto 20px auto;

    background-color: white;
    border-radius: 18px;

    box-shadow: 7px 5px 0px #222;

    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .spin-text {
    font-size: 55px;
    font-weight: bold;
    margin-top: 15px;
    margin-bottom: 5px;
  }

  /* Pointer */
  .wheel-container {
    position: relative;
    width: 145px;
    height: 145px;
  }

  /* Color wheel */
  .wheel {
    display: block;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 1px solid black;
    border-radius: 50%;
    cursor: pointer;

    background: conic-gradient(
      #4d9bf5 0deg 90deg,
      #f7f522 90deg 180deg,
      #e52e32 180deg 270deg,
      #7774d9 270deg 360deg
    );
    transition-property: transform;
    transition-timing-function: ease-out;
  }
  /* disabled state for the wheel */
  .wheel:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
  /* Pointer */
  .pointer {
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    pointer-events: none;

    width: 0;
    height: 0;
    border-left: 9px solid transparent;
    border-right: 9px solid transparent;
    border-top: 16px solid black;
  }

  /* spinning
  .spinning {
    animation: spin 2s ease-out;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(1440deg);
    }
  } */

  /* Pointer */
  .wheel-container {
    position: relative;
    width: 145px;
    height: 145px;
    cursor: pointer;
  }

  /* Deck button */
  .deck-button {
    width: 210px;
    height: 115px;

    border: none;
    border-radius: 25px;

    background-color: white;

    font-size: 28px;
    font-weight: bold;

    cursor: pointer;
  }

  .deck-button:hover {
    background-color: #eeeeee;
  }
</style>
