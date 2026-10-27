<template>
  <div class="upload-page__steps" aria-label="Upload steps">
    <template v-for="(step, i) in steps" :key="step.n">
      <q-separator v-if="i > 0" class="upload-page__step-divider" />
      <div
        class="upload-page__step"
        :class="{
          'upload-page__step--active': currentStep === step.n,
          'upload-page__step--done': currentStep > step.n
        }"
      >
        <q-badge
          :color="currentStep >= step.n ? 'primary' : 'grey-5'"
          rounded
          :label="step.n"
        />
        <span>{{ step.label }}</span>
      </div>
    </template>
  </div>
</template>

<script setup>
defineProps({ currentStep: { type: Number, required: true } })

const steps = [
  { n: 1, label: 'Upload files' },
  { n: 2, label: 'Add segments' },
  { n: 3, label: 'Save' }
]
</script>
