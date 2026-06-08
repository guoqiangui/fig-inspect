<script setup lang="ts">
import CopyableValue from './CopyableValue.vue'
import SectionCollapse from './SectionCollapse.vue'
import type { BorderStyles } from '~/types/inspector'

defineProps<{ border: BorderStyles }>()

function hasBorder(b: BorderStyles): boolean {
  return b.borderTopWidth !== '0px' || b.borderRightWidth !== '0px'
    || b.borderBottomWidth !== '0px' || b.borderLeftWidth !== '0px'
}

function hasRadius(b: BorderStyles): boolean {
  return b.borderTopLeftRadius !== '0px' || b.borderTopRightRadius !== '0px'
    || b.borderBottomRightRadius !== '0px' || b.borderBottomLeftRadius !== '0px'
}

function allSame(a: string, b: string, c: string, d: string): boolean {
  return a === b && b === c && c === d
}
</script>

<template>
  <SectionCollapse title="Border" :default-open="hasBorder(border) || hasRadius(border)">
    <div class="prop-grid">
      <template v-if="hasBorder(border)">
        <template v-if="allSame(border.borderTopWidth, border.borderRightWidth, border.borderBottomWidth, border.borderLeftWidth)">
          <div class="prop-row">
            <span class="prop-label">Width</span>
            <CopyableValue :value="border.borderTopWidth" />
          </div>
        </template>
        <template v-else>
          <div class="prop-row">
            <span class="prop-label">Top W.</span>
            <CopyableValue :value="border.borderTopWidth" />
          </div>
          <div class="prop-row">
            <span class="prop-label">Right W.</span>
            <CopyableValue :value="border.borderRightWidth" />
          </div>
          <div class="prop-row">
            <span class="prop-label">Bottom W.</span>
            <CopyableValue :value="border.borderBottomWidth" />
          </div>
          <div class="prop-row">
            <span class="prop-label">Left W.</span>
            <CopyableValue :value="border.borderLeftWidth" />
          </div>
        </template>

        <template v-if="allSame(border.borderTopColor, border.borderRightColor, border.borderBottomColor, border.borderLeftColor)">
          <div class="prop-row">
            <span class="prop-label">Color</span>
            <CopyableValue :value="border.borderTopColor" color-preview />
          </div>
        </template>
        <template v-else>
          <div class="prop-row">
            <span class="prop-label">Top C.</span>
            <CopyableValue :value="border.borderTopColor" color-preview />
          </div>
          <div class="prop-row">
            <span class="prop-label">Right C.</span>
            <CopyableValue :value="border.borderRightColor" color-preview />
          </div>
          <div class="prop-row">
            <span class="prop-label">Bottom C.</span>
            <CopyableValue :value="border.borderBottomColor" color-preview />
          </div>
          <div class="prop-row">
            <span class="prop-label">Left C.</span>
            <CopyableValue :value="border.borderLeftColor" color-preview />
          </div>
        </template>

        <div class="prop-row">
          <span class="prop-label">Style</span>
          <CopyableValue :value="border.borderTopStyle" />
        </div>
      </template>

      <template v-if="hasRadius(border)">
        <template v-if="allSame(border.borderTopLeftRadius, border.borderTopRightRadius, border.borderBottomRightRadius, border.borderBottomLeftRadius)">
          <div class="prop-row">
            <span class="prop-label">Radius</span>
            <CopyableValue :value="border.borderTopLeftRadius" />
          </div>
        </template>
        <template v-else>
          <div class="prop-row">
            <span class="prop-label">TL Radius</span>
            <CopyableValue :value="border.borderTopLeftRadius" />
          </div>
          <div class="prop-row">
            <span class="prop-label">TR Radius</span>
            <CopyableValue :value="border.borderTopRightRadius" />
          </div>
          <div class="prop-row">
            <span class="prop-label">BR Radius</span>
            <CopyableValue :value="border.borderBottomRightRadius" />
          </div>
          <div class="prop-row">
            <span class="prop-label">BL Radius</span>
            <CopyableValue :value="border.borderBottomLeftRadius" />
          </div>
        </template>
      </template>

      <div v-if="!hasBorder(border) && !hasRadius(border)" class="empty">
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
