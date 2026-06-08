<script setup lang="ts">
import CopyableValue from './CopyableValue.vue'
import SectionCollapse from './SectionCollapse.vue'
import type { EffectStyles } from '~/types/inspector'

defineProps<{ effects: EffectStyles }>()

function hasEffects(e: EffectStyles): boolean {
  return (e.boxShadow !== 'none' && e.boxShadow !== '')
    || e.opacity !== '1'
    || (e.transform !== 'none' && e.transform !== '')
    || (e.filter !== 'none' && e.filter !== '')
}
</script>

<template>
  <SectionCollapse title="Effects" :default-open="hasEffects(effects)">
    <div class="prop-grid">
      <div v-if="effects.boxShadow !== 'none' && effects.boxShadow !== ''" class="prop-row">
        <span class="prop-label">Shadow</span>
        <CopyableValue :value="effects.boxShadow" />
      </div>
      <div v-if="effects.opacity !== '1'" class="prop-row">
        <span class="prop-label">Opacity</span>
        <CopyableValue :value="effects.opacity" />
      </div>
      <div class="prop-row">
        <span class="prop-label">Overflow</span>
        <CopyableValue :value="effects.overflow" />
      </div>
      <div v-if="effects.transform !== 'none' && effects.transform !== ''" class="prop-row">
        <span class="prop-label">Transform</span>
        <CopyableValue :value="effects.transform" />
      </div>
      <div v-if="effects.filter !== 'none' && effects.filter !== ''" class="prop-row">
        <span class="prop-label">Filter</span>
        <CopyableValue :value="effects.filter" />
      </div>
      <div v-if="effects.mixBlendMode !== 'normal'" class="prop-row">
        <span class="prop-label">Blend</span>
        <CopyableValue :value="effects.mixBlendMode" />
      </div>
      <div v-if="!hasEffects(effects) && effects.overflow === 'visible'" class="empty">
        None
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
.empty {
  font-size: 11px;
  color: #d1d5db;
  padding: 2px 0;
}
</style>
