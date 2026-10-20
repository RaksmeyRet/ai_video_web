<template>
  <div
    class="dropzone upload-card__dropzone"
    :class="{ 'dropzone--active': dragging }"
    role="button"
    tabindex="0"
    aria-label="Select or drop a video file"
    @click="emit('browse')"
    @keydown.enter.prevent="emit('browse')"
    @keydown.space.prevent="emit('browse')"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
  >
    <q-avatar
      rounded
      size="56px"
      color="blue-1"
      text-color="primary"
      icon="cloud_upload"
      class="upload-card__icon"
    />
    <div class="upload-card__drop-title">Drag and drop your video here</div>
    <div class="text-caption text-grey-7">or select a file from your device</div>
    <q-btn
      outline
      rounded
      no-caps
      color="primary"
      icon="folder_open"
      label="Browse files"
      @click.stop="emit('browse')"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['browse', 'drop'])
const dragging = ref(false)

function onDrop(e) {
  dragging.value = false
  emit('drop', e.dataTransfer?.files?.[0])
}
</script>
