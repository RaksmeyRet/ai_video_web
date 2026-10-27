<template>
  <div class="upload-card__segment">
    <div class="upload-card__segment-head">
      <span class="upload-card__segment-title">Segment {{ index + 1 }}</span>
      <q-btn
        flat
        round
        dense
        icon="delete_outline"
        color="grey-7"
        aria-label="Remove segment"
        :disable="disabled || !canRemove"
        @click="emit('remove')"
      />
    </div>

    <div class="upload-card__grid q-mt-md">
      <!-- Video: start and end in seconds -->
      <template v-if="sourceType === 'video'">
        <q-input
          v-model="seg.startTime"
          type="number"
          min="0"
          step="0.1"
          outlined
          dense
          label="Start time (seconds)"
          placeholder="0.0"
          suffix="s"
          :disable="disabled"
        />
        <q-input
          v-model="seg.endTime"
          type="number"
          min="0"
          step="0.1"
          outlined
          dense
          label="End time (seconds)"
          placeholder="30.0"
          suffix="s"
          :disable="disabled"
        />
      </template>

      <!-- PDF: start and end page -->
      <template v-else>
        <q-input
          v-model="seg.pageStart"
          type="number"
          min="1"
          outlined
          dense
          label="Start page"
          :disable="disabled"
        />
        <q-input
          v-model="seg.pageEnd"
          type="number"
          min="1"
          outlined
          dense
          label="End page"
          :disable="disabled"
        />
      </template>
    </div>

    <q-input
      v-model="seg.title"
      outlined
      dense
      class="q-mt-md"
      label="Title"
      placeholder="Introduction & Welcome"
      :disable="disabled"
    />
    <q-input
      v-model="seg.summary"
      type="textarea"
      outlined
      autogrow
      class="q-mt-md"
      label="Summary"
      :disable="disabled"
    />
    <q-input
      v-model="seg.transcript"
      type="textarea"
      outlined
      autogrow
      class="q-mt-md"
      label="Transcript (optional)"
      :disable="disabled"
    />
    <q-select
      v-model="seg.keywords"
      outlined
      dense
      multiple
      use-input
      use-chips
      hide-dropdown-icon
      new-value-mode="add-unique"
      class="q-mt-md"
      label="Keywords"
      hint="Type a keyword and press Enter"
      :disable="disabled"
    />
    <q-select
      v-model="seg.questions"
      outlined
      dense
      multiple
      use-input
      use-chips
      hide-dropdown-icon
      new-value-mode="add-unique"
      class="q-mt-md"
      label="Possible questions"
      hint="Type a question and press Enter"
      :disable="disabled"
    />
  </div>
</template>

<script setup>
// defineModel needs Vue 3.4+
const seg = defineModel({ type: Object, required: true })

defineProps({
  index: { type: Number, required: true },
  sourceType: { type: String, default: 'video' }, // 'video' | 'pdf'
  disabled: { type: Boolean, default: false },
  canRemove: { type: Boolean, default: true }
})
const emit = defineEmits(['remove'])
</script>
