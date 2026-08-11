<script setup>
import { nextUiId } from './id';
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, required: true },
  id: { type: String, default: '' },
  options: { type: Array, required: true },
  hint: { type: String, default: '' },
  disabled: Boolean,
});
const emit = defineEmits(['update:modelValue', 'change']);
const controlId = props.id || nextUiId('toon-select');
const optionValue = (option) => typeof option === 'object' ? option.value : option;
const optionLabel = (option) => typeof option === 'object' ? option.label : option;
</script>

<template>
  <label class="field" :for="controlId">
    <span class="label">{{ label }}</span>
    <span class="control"><select :id="controlId" :value="modelValue" :disabled="disabled" :aria-describedby="hint ? `${controlId}-help` : undefined" @change="emit('update:modelValue', $event.target.value); emit('change', $event)"><option v-for="option in options" :key="optionValue(option)" :value="optionValue(option)">{{ optionLabel(option) }}</option></select><i aria-hidden="true"></i></span>
    <small v-if="hint" :id="`${controlId}-help`">{{ hint }}</small>
  </label>
</template>

<style scoped lang="scss">
@use '../../styles/tokens' as *;
.field { display: grid; gap: 8px; min-width: 0; }
.label { @include readable-label; }
.control { position: relative; display: flex; align-items: center; min-height: 54px; background: white; border: 1.5px solid $line; border-radius: $radius-sm; transition: .18s ease; }
.control:focus-within { border-color: $violet; @include focus-ring; }
select { width: 100%; padding: 14px 44px 14px 16px; appearance: none; border: 0; outline: 0; color: $ink; background: transparent; font: inherit; cursor: pointer; }
i { position: absolute; right: 17px; width: 9px; height: 9px; border-right: 2px solid $ink; border-bottom: 2px solid $ink; transform: translateY(-3px) rotate(45deg); pointer-events: none; }
small { color: $muted; font-size: .82rem; line-height: 1.4; }
</style>
