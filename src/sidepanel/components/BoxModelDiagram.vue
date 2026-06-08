<script setup lang="ts">
import SectionCollapse from './SectionCollapse.vue'
import type { BoxModelData } from '~/types/inspector'

defineProps<{ boxModel: BoxModelData }>()

function fmt(v: number): string {
  return v === 0 ? '0' : `${Math.round(v)}`
}
</script>

<template>
  <SectionCollapse title="Box Model">
    <div class="box-model-diagram">
      <!-- Margin layer -->
      <div class="margin-layer">
        <div class="layer-label">
          margin
        </div>
        <div class="side top">
          {{ fmt(boxModel.margin.top) }}
        </div>
        <div class="side right">
          {{ fmt(boxModel.margin.right) }}
        </div>
        <div class="side bottom">
          {{ fmt(boxModel.margin.bottom) }}
        </div>
        <div class="side left">
          {{ fmt(boxModel.margin.left) }}
        </div>

        <!-- Border layer -->
        <div class="border-layer">
          <div class="layer-label">
            border
          </div>
          <div class="side top">
            {{ fmt(boxModel.border.top) }}
          </div>
          <div class="side right">
            {{ fmt(boxModel.border.right) }}
          </div>
          <div class="side bottom">
            {{ fmt(boxModel.border.bottom) }}
          </div>
          <div class="side left">
            {{ fmt(boxModel.border.left) }}
          </div>

          <!-- Padding layer -->
          <div class="padding-layer">
            <div class="layer-label">
              padding
            </div>
            <div class="side top">
              {{ fmt(boxModel.padding.top) }}
            </div>
            <div class="side right">
              {{ fmt(boxModel.padding.right) }}
            </div>
            <div class="side bottom">
              {{ fmt(boxModel.padding.bottom) }}
            </div>
            <div class="side left">
              {{ fmt(boxModel.padding.left) }}
            </div>

            <!-- Content -->
            <div class="content-layer">
              {{ Math.round(boxModel.content.width) }} × {{ Math.round(boxModel.content.height) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </SectionCollapse>
</template>

<style scoped>
.box-model-diagram {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 10px;
  text-align: center;
}
.margin-layer,
.border-layer,
.padding-layer {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 28px;
}
.margin-layer {
  background: rgba(249, 115, 22, 0.15);
  border: 1px dashed rgba(249, 115, 22, 0.4);
  border-radius: 4px;
}
.border-layer {
  background: rgba(251, 191, 36, 0.15);
  border: 1px dashed rgba(251, 191, 36, 0.5);
  border-radius: 3px;
  width: 100%;
}
.padding-layer {
  background: rgba(34, 197, 94, 0.15);
  border: 1px dashed rgba(34, 197, 94, 0.5);
  border-radius: 2px;
  width: 100%;
}
.content-layer {
  background: rgba(79, 70, 229, 0.15);
  border: 1px dashed rgba(79, 70, 229, 0.4);
  border-radius: 2px;
  padding: 8px 16px;
  color: #4338ca;
  font-weight: 600;
  white-space: nowrap;
}
.layer-label {
  position: absolute;
  top: 1px;
  left: 4px;
  font-size: 9px;
  color: #9ca3af;
  text-transform: uppercase;
}
.side {
  position: absolute;
  color: #6b7280;
}
.side.top {
  top: 1px;
  left: 50%;
  transform: translateX(-50%);
}
.side.bottom {
  bottom: 1px;
  left: 50%;
  transform: translateX(-50%);
}
.side.left {
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
}
.side.right {
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
}
</style>
