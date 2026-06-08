<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  value: string
  label?: string
  colorPreview?: boolean
}>()

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  try {
    await navigator.clipboard.writeText(props.value)
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => {
      copied.value = false
    }, 1500)
  }
  catch {}
}

watch(
  () => props.value,
  () => {
    copied.value = false
  },
)
</script>

<template>
  <span
    class="copyable-value"
    :class="{ copied }"
    :title="`Click to copy: ${value}`"
    @click="copy"
  >
    <span
      v-if="
        colorPreview
          && value
          && value !== 'transparent'
          && value !== 'rgba(0, 0, 0, 0)'
      "
      class="color-swatch"
      :style="{ backgroundColor: value }"
    />
    <span class="value-text">{{ label || value }}</span>
    <span v-if="copied" class="copied-badge">Copied</span>
  </span>
</template>

<style scoped>
.copyable-value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 4px;
  border-radius: 3px;
  cursor: pointer;
  font-family: "SF Mono", Monaco, "Cascadia Code", monospace;
  font-size: 11px;
  color: #374151;
  transition: background 0.15s;
}
.copyable-value:hover {
  background: #f3f4f6;
}
.copyable-value.copied {
  background: #ecfdf5;
}
.color-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}
.copied-badge {
  font-size: 9px;
  color: #059669;
  font-weight: 600;
}
.value-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}
</style>
