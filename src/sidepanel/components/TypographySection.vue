<script setup lang="ts">
import CopyableValue from './CopyableValue.vue'
import SectionCollapse from './SectionCollapse.vue'
import type { TypographyStyles } from '~/types/inspector'

defineProps<{ typography: TypographyStyles }>()
</script>

<template>
  <SectionCollapse title="Typography">
    <div class="prop-grid">
      <div class="prop-row">
        <span class="prop-label">Font</span>
        <CopyableValue :value="typography.fontFamily" />
      </div>
      <div class="prop-row">
        <span class="prop-label">Size</span>
        <CopyableValue :value="typography.fontSize" />
      </div>
      <div class="prop-row">
        <span class="prop-label">Weight</span>
        <CopyableValue :value="typography.fontWeight" />
      </div>
      <div v-if="typography.fontStyle !== 'normal'" class="prop-row">
        <span class="prop-label">Style</span>
        <CopyableValue :value="typography.fontStyle" />
      </div>
      <div class="prop-row">
        <span class="prop-label">Color</span>
        <CopyableValue :value="typography.color" color-preview />
      </div>
      <div class="prop-row">
        <span class="prop-label">Line H.</span>
        <CopyableValue :value="typography.lineHeight" />
      </div>
      <div v-if="typography.letterSpacing !== 'normal'" class="prop-row">
        <span class="prop-label">Spacing</span>
        <CopyableValue :value="typography.letterSpacing" />
      </div>
      <div class="prop-row">
        <span class="prop-label">Align</span>
        <CopyableValue :value="typography.textAlign" />
      </div>
      <div v-if="typography.textDecoration !== 'none' && !typography.textDecoration.startsWith('none')" class="prop-row">
        <span class="prop-label">Decoration</span>
        <CopyableValue :value="typography.textDecoration" />
      </div>
      <div v-if="typography.textTransform !== 'none'" class="prop-row">
        <span class="prop-label">Transform</span>
        <CopyableValue :value="typography.textTransform" />
      </div>
    </div>
  </SectionCollapse>
</template>

<style scoped>
.prop-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.prop-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 22px;
}
.prop-label {
  font-size: 11px;
  color: #9ca3af;
  flex-shrink: 0;
  width: 70px;
}
</style>
