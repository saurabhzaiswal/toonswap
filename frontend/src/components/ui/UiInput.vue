<script setup>
import { nextUiId } from './id';
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, required: true },
  id: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  required: Boolean,
  disabled: Boolean,
});
const emit = defineEmits(['update:modelValue', 'change']);
const controlId = props.id || nextUiId('toon-input');
</script>

<template>
  <label class="field" :for="controlId">
    <span class="label">{{ label }} <b v-if="required" aria-hidden="true">*</b></span>
    <span class="control"
      ><slot name="leading" /><input
        :id="controlId"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :aria-invalid="Boolean(error)"
        :aria-describedby="hint || error ? `${controlId}-help` : undefined"
        @input="emit('update:modelValue', $event.target.value)"
        @change="emit('change', $event)"
    /></span>
    <small v-if="hint || error" :id="`${controlId}-help`" :class="{ error }">{{
      error || hint
    }}</small>
  </label>
</template>

<style scoped lang="scss">
@use '../../styles/tokens' as *;
.field {
  display: grid;
  gap: 8px;
  min-width: 0;
}
.label {
  @include readable-label;
}
.label b {
  color: $coral;
}
.control {
  display: flex;
  align-items: center;
  min-height: 54px;
  overflow: hidden;
  background: white;
  border: 1.5px solid $line;
  border-radius: $radius-sm;
  transition: 0.18s ease;
}
.control:focus-within {
  border-color: $violet;
  @include focus-ring;
}
input {
  width: 100%;
  min-width: 0;
  padding: 14px 16px;
  border: 0;
  outline: 0;
  color: $ink;
  background: transparent;
  font: inherit;
}
input::placeholder {
  color: #9993a2;
}
small {
  color: $muted;
  font-size: 0.82rem;
  line-height: 1.4;
}
small.error {
  color: #b73428;
}
input:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
</style>
