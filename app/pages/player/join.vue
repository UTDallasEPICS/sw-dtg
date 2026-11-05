<script setup lang="ts">
  interface JoinResponse {
    pin: string
    player: string
    players: string[]
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

  const isFormValid = computed(() => {
    return (
      new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin.value) &&
      name.value.trim().length > 0 &&
      name.value.trim().length <= MAX_NAME_LENGTH
    )
  })

  function handlePinInput(value: string) {
    // Keep the field numeric and no longer than a game PIN.
    pin.value = value.replace(/\D/g, '').slice(0, PIN_LENGTH)
    pinError.value = ''
    serverError.value = ''
  }

  function handleNameInput() {
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
      pinError.value = 'The game PIN must be exactly 6 digits.'
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

    if (value.length > MAX_NAME_LENGTH) {
      nameError.value = `Names must be ${MAX_NAME_LENGTH} characters or fewer.`
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
      return 'That name is already in use in this game. Please choose another.'
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

      await navigateTo({
        path: '/lobby/student',
        query: { pin: result.pin },
      })
    } catch (error) {
      serverError.value = getServerErrorMessage(error)
    } finally {
      isSubmitting.value = false
    }
  }
</script>

<template>
  <UContainer class="flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <p class="text-primary text-sm font-semibold tracking-wide uppercase">Stronger Twister</p>
          <h1 class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">Join a Game</h1>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Enter the game PIN from your teacher to join the lobby.
          </p>
        </div>
      </template>

      <form class="space-y-5" novalidate @submit.prevent="handleSubmit">
        <UAlert
          v-if="serverError"
          color="error"
          variant="subtle"
          icon="i-heroicons-exclamation-triangle-20-solid"
          title="Unable to join"
          :description="serverError"
        />

        <UFormField label="Game PIN" name="pin" :error="pinError">
          <UInput
            v-model="pin"
            class="w-full"
            size="lg"
            inputmode="numeric"
            autocomplete="off"
            placeholder="123456"
            :maxlength="PIN_LENGTH"
            :disabled="isSubmitting"
            @update:model-value="handlePinInput"
            @blur="validatePin"
          />
        </UFormField>

        <UFormField label="Your name" name="name" :error="nameError">
          <UInput
            v-model="name"
            class="w-full"
            size="lg"
            autocomplete="name"
            placeholder="Alex"
            :maxlength="MAX_NAME_LENGTH"
            :disabled="isSubmitting"
            @update:model-value="handleNameInput"
            @blur="validateName"
          />
        </UFormField>

        <UButton
          type="submit"
          class="w-full justify-center"
          size="lg"
          :loading="isSubmitting"
          :disabled="isSubmitting || !isFormValid"
        >
          {{ isSubmitting ? 'Joining game...' : 'Join Game' }}
        </UButton>
      </form>
    </UCard>
  </UContainer>
</template>
