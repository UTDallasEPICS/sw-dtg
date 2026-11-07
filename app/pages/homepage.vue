<script setup lang="ts">
  const toast = useToast()

  function handleTeacherClick() {
    navigateTo('/admin/setup')
  }

  function handleStudentClick() {
    toast.add({
      title: 'Coming Soon',
      description: 'Student page coming soon',
      color: 'info',
    })
    navigateTo('/player/join')
  }
</script>

<template>
  <UContainer class="py-10">
    <div class="flex flex-col items-center justify-center gap-6 py-12">
      <h1 class="text-3xl font-bold">Stronger Twister</h1>
      <div class="flex flex-col gap-4 sm:flex-row">
        <UButton label="Teacher" color="primary" size="lg" @click="handleTeacherClick" />
        <UButton label="Student" color="secondary" size="lg" @click="handleStudentClick" />
      </div>
    </div>
  </UContainer>
</template>
