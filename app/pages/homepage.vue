<script setup lang="ts">
  const toast = useToast()

  function handleTeacherClick() {
    toast.add({
      title: 'Coming Soon',
      description: 'Teacher page coming soon',
      color: 'info',
    })
  }

  function handleStudentClick() {
    toast.add({
      title: 'Coming Soon',
      description: 'Student page coming soon',
      color: 'info',
    })
  }
</script>

<template>
  <UContainer class="py-10">
    <div class="flex flex-col items-center justify-center gap-6 py-12">
      <h1 class="text-3xl font-bold">Stronger Twister</h1>
      <div class="flex flex-col sm:flex-row gap-4">
        <UButton label="Teacher" color="primary" size="lg" @click="handleTeacherClick" />
        <UButton label="Student" color="secondary" size="lg" @click="handleStudentClick" />
      </div>
    </div>
  </UContainer>
</template>
