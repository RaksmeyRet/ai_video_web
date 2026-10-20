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
      <q-input
        v-model="seg.startTime"
        outlined
        dense
        label="Start time (mm:ss)"
        placeholder="06:16"
        mask="##:##"
        :disable="disabled"
      />
      <q-input
        v-model="seg.endTime"
        outlined
        dense
        label="End time (mm:ss)"
        placeholder="08:40"
        mask="##:##"
        :disable="disabled"
      />
    </div>

    <q-input
      v-model="seg.title"
      outlined
      dense
      class="q-mt-md"
      label="Title"
      placeholder="How to Apply for Invoice Financing"
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
  disabled: { type: Boolean, default: false },
  canRemove: { type: Boolean, default: true }
})
const emit = defineEmits(['remove'])
</script>
