<script setup lang="ts">
  interface JoinResponse {
    pin: string
    player: {
      id: string
      name: string
      cardsRead: number
    }
    players: {
      id: string
      name: string
      cardsRead: number
    }[]
  }

  interface JoinError {
    statusCode?: number
    statusMessage?: string
    data?: {
      code?: string
      statusMessage?: string
      message?: string
    }
  }

  const PIN_LENGTH = 6
  const MAX_NAME_LENGTH = 30

  const pin = ref('')
  const name = ref('')

  const pinError = ref('')
  const nameError = ref('')
  const serverError = ref('')

  const isSubmitting = ref(false)

  // Basic client-side validation
  const isFormValid = computed(() => {
    return (
      new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin.value) &&
      name.value.trim().length > 0 &&
      name.value.trim().length <= MAX_NAME_LENGTH
    )
  })

  function handlePinInput(event: Event) {
    const target = event.target as HTMLInputElement
    // Keep the field numeric and truncate to 6 digits
    pin.value = target.value.replace(/\D/g, '').slice(0, PIN_LENGTH)
    target.value = pin.value
    pinError.value = ''
    serverError.value = ''
  }

  function handleNameInput(event: Event) {
    const target = event.target as HTMLInputElement
    name.value = target.value.slice(0, MAX_NAME_LENGTH)
    target.value = name.value
    nameError.value = ''
    serverError.value = ''
  }

  function validatePin() {
    const value = pin.value.trim()
    if (!value) {
      pinError.value = 'Enter the 6-digit game PIN.'
      return false
    }
    if (!new RegExp(`^\\d{${PIN_LENGTH}}$`).test(value)) {
      pinError.value = 'Game PIN must be 6 digits.'
      return false
    }
    pinError.value = ''
    return true
  }

  function validateName() {
    const value = name.value.trim()
    if (!value) {
      nameError.value = 'Enter your name.'
      return false
    }
    nameError.value = ''
    return true
  }

  function getServerErrorMessage(error: unknown) {
    const joinError = error as JoinError
    const code = joinError.data?.code
    const message = joinError.data?.statusMessage ?? joinError.statusMessage

    if (code === 'ROOM_NOT_FOUND' || joinError.statusCode === 404) {
      return 'Game not found. Check the PIN and try again.'
    }
    if (code === 'ROOM_CLOSED') {
      return 'This game has already started or ended.'
    }
    if (code === 'DUPLICATE_NAME') {
      return 'That name is already taken. Please choose another.'
    }
    if (code === 'INVALID_PIN' || code === 'INVALID_NAME' || joinError.statusCode === 400) {
      return message || 'Check the game PIN and your name, then try again.'
    }
    return 'Unable to join the game right now. Please try again.'
  }

  async function handleSubmit() {
    if (isSubmitting.value) return

    serverError.value = ''

    const isPinValid = validatePin()
    const isNameValid = validateName()

    if (!isPinValid || !isNameValid) return

    isSubmitting.value = true

    try {
      const result = await $fetch<JoinResponse>(`/api/rooms/${pin.value.trim()}/players`, {
        method: 'POST',
        body: { name: name.value.trim() },
      })

      // Navigate to student lobby passing the PIN and student name
      await navigateTo({
        path: '/lobby/student',
        query: {
          pin: result.pin,
          name: name.value.trim(),
        },
      })
    } catch (error) {
      serverError.value = getServerErrorMessage(error)
    } finally {
      isSubmitting.value = false
    }
  }
</script>

<template>
  <main class="join-container">
    <!-- Header: Game Title -->
    <header class="header-section">
      <h1 class="game-title">Stronger Twister</h1>
    </header>

    <!-- Center Section: Card with offset hard black shadow matching Figma -->
    <section class="form-section">
      <div class="join-card-box">
        <form class="join-form" novalidate @submit.prevent="handleSubmit">
          <!-- Field 1: Game Pin -->
          <div class="field-group">
            <label for="game-pin-input" class="field-label">game pin</label>
            <div class="input-row">
              <input
                id="game-pin-input"
                :value="pin"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                placeholder=""
                class="field-input"
                :disabled="isSubmitting"
                @input="handlePinInput"
                @blur="validatePin"
              />
            </div>
            <p v-if="pinError" class="field-error">{{ pinError }}</p>
          </div>

          <!-- Field 2: Name -->
          <div class="field-group">
            <label for="student-name-input" class="field-label">Name</label>
            <div class="input-row">
              <input
                id="student-name-input"
                :value="name"
                type="text"
                autocomplete="name"
                placeholder=""
                class="field-input"
                :disabled="isSubmitting"
                @input="handleNameInput"
                @blur="validateName"
              />
            </div>
            <p v-if="nameError" class="field-error">{{ nameError }}</p>
          </div>

          <!-- Server / Validation Error Feedback -->
          <p v-if="serverError" class="server-error">{{ serverError }}</p>

          <!-- Submit Button: Clean pill matching the design aesthetic -->
          <button type="submit" class="submit-btn" :disabled="isSubmitting || !isFormValid">
            {{ isSubmitting ? 'Joining...' : 'Join Game!' }}
          </button>
        </form>
      </div>
    </section>
  </main>
</template>

<style scoped>
  /* ==========================================================================
     1. Full-Screen Page Container
     Pure full-screen butter yellow (#fffbd6) with no border fluff
     ========================================================================== */
  .join-container {
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
     3. Center Section & Card with Hard Offset Shadow
     Matching the white rounded card with bold black offset drop shadow in Figma
     ========================================================================== */
  .form-section {
    width: 100%;
    max-width: 320px;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 2rem 0;
  }

  .join-card-box {
    width: 100%;
    max-width: 290px;
    background-color: #ffffff;
    border-radius: 36px;
    padding: 2.25rem 1.75rem;
    /* Signature hard black offset shadow matching Figma */
    box-shadow: 14px 12px 0px #1a1a1a;
    box-sizing: border-box;
  }

  .join-form {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  /* ==========================================================================
     4. Input Field Groups & Grey Rounded Inputs
     Matches the subtle grey rounded input rectangles shown in the mockup
     ========================================================================== */
  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .field-label {
    font-size: 1.75rem;
    font-weight: 800;
    color: #111111;
    letter-spacing: -0.3px;
    line-height: 1.2;
  }

  .input-row {
    width: 100%;
    display: flex;
    align-items: center;
  }

  .field-input {
    width: 100%;
    height: 48px;
    background-color: #d1d5db; /* Clean soft grey matching the mockup */
    border: none;
    border-radius: 12px;
    padding: 0 1rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: #1f2937;
    outline: none;
    transition:
      background-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .field-input:focus {
    background-color: #c5cbd3;
    box-shadow: 0 0 0 2px #1a1a1a;
  }

  .field-error {
    color: #dc2626;
    font-size: 0.85rem;
    font-weight: 600;
    margin: 0.25rem 0 0 0;
  }

  .server-error {
    color: #dc2626;
    font-size: 0.9rem;
    font-weight: 600;
    text-align: center;
    margin: 0;
  }

  /* ==========================================================================
     5. Action Submit Button ("Join Game!")
     ========================================================================== */
  .submit-btn {
    width: 100%;
    margin-top: 0.5rem;
    background-color: #111111;
    color: #ffffff;
    font-size: 1.35rem;
    font-weight: 800;
    padding: 0.9rem 1rem;
    border-radius: 9999px;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease,
      background-color 0.15s ease;
  }

  .submit-btn:hover:not(:disabled) {
    background-color: #262626;
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.16);
  }

  .submit-btn:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .submit-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* ==========================================================================
     6. Desktop Enhancements (min-width: 768px)
     Full-screen canvas with proportional scaling
     ========================================================================== */
  @media (min-width: 768px) {
    .join-container {
      padding: 4.5rem 2rem 4rem 2rem;
    }

    .game-title {
      font-size: 3rem;
    }

    .form-section {
      max-width: 400px;
    }

    .join-card-box {
      max-width: 350px;
      padding: 2.75rem 2.25rem;
      box-shadow: 16px 14px 0px #1a1a1a;
      border-radius: 40px;
    }

    .field-label {
      font-size: 2rem;
    }

    .field-input {
      height: 54px;
      font-size: 1.4rem;
      border-radius: 14px;
    }

    .submit-btn {
      font-size: 1.5rem;
      padding: 1rem 1.25rem;
    }
  }
</style>
