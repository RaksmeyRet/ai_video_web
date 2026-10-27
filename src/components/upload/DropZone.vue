<template>
  <div
    class="file-drop"
    :class="{ 'file-drop--active': dragging }"
    role="button"
    tabindex="0"
    :aria-label="title"
    :aria-disabled="disabled"
    @click="open"
    @keydown.enter.prevent="open"
    @keydown.space.prevent="open"
    @dragover.prevent="dragging = !disabled"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
  >
    <q-icon :name="icon" size="36px" color="primary" />
    <div class="file-drop__title">{{ title }}</div>
    <div class="file-drop__hint">{{ hint }}</div>
    <q-btn
      outline
      rounded
      dense
      no-caps
      color="primary"
      icon="folder_open"
      label="Browse"
      class="q-px-md q-mt-xs"
      :disable="disabled"
      @click.stop="open"
    />
    <input ref="inputRef" type="file" :accept="accept" hidden @change="onPick" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  hint: { type: String, default: '' },
  icon: { type: String, default: 'cloud_upload' },
  accept: { type: String, default: '*/*' },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['select'])

const inputRef = ref(null)
const dragging = ref(false)

const open = () => !props.disabled && inputRef.value?.click()

function onPick(e) {
  const f = e.target.files?.[0]
  e.target.value = '' // allow picking the same file again
  if (f) emit('select', f)
}

function onDrop(e) {
  dragging.value = false
  if (props.disabled) return
  const f = e.dataTransfer?.files?.[0]
  if (f) emit('select', f)
}
</script>

<style lang="scss" scoped>
.file-drop {
  min-height: 200px;
  box-sizing: border-box;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;
  border: 1.5px dashed #bcd0ea;
  border-radius: 14px;
  background: #f5f9fe;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;

  &:hover,
  &:focus-visible,
  &--active {
    border-color: var(--q-primary);
    background: #eaf2fd;
    outline: none;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
  }

  &__hint {
    font-size: 12px;
    color: #5f6b7a;
  }
}
</style>
