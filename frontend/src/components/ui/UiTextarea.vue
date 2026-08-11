<script setup>
import { nextUiId } from './id';
const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, required: true },
  id: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  hint: { type: String, default: '' },
  rows: { type: Number, default: 4 },
});
const emit = defineEmits(['update:modelValue', 'change']);
const controlId = props.id || nextUiId('toon-textarea');
</script>

<template>
  <label class="field" :for="controlId"><span class="label">{{ label }}</span><textarea :id="controlId" :value="modelValue" :rows="rows" :placeholder="placeholder" :aria-describedby="hint ? `${controlId}-help` : undefined" @input="emit('update:modelValue', $event.target.value)" @change="emit('change', $event)"></textarea><small v-if="hint" :id="`${controlId}-help`">{{ hint }}</small></label>
</template>

<style scoped lang="scss">
@use '../../styles/tokens' as *;
.field { display: grid; gap: 8px; min-width: 0; }
.label { @include readable-label; }
textarea { width: 100%; min-height: 120px; resize: vertical; padding: 15px 16px; border: 1.5px solid $line; border-radius: $radius-sm; outline: 0; color: $ink; background: white; font: inherit; line-height: 1.55; transition: .18s ease; }
textarea:focus { border-color: $violet; @include focus-ring; }
textarea::placeholder { color: #9993a2; }
small { color: $muted; font-size: .82rem; line-height: 1.4; }
</style>
