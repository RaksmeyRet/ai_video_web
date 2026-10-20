<template>
  <div>
    <q-linear-progress rounded size="8px" :value="progress" />
    <div class="text-caption text-grey-8 q-mt-xs">
      Uploading {{ Math.round(progress * 100) }}%
    </div>
  </div>
</template>

<script setup>
defineProps({ progress: { type: Number, default: 0 } })
</script>
