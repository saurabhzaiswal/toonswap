<script setup>
defineProps({
  modelValue: { type: [Number, String], default: 50 },
  label: { type: String, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  suffix: { type: String, default: '%' },
});
const emit = defineEmits(['update:modelValue', 'change']);
</script>
<template>
  <label
    ><span
      >{{ label }} <b>{{ modelValue }}{{ suffix }}</b></span
    ><input
      :value="modelValue"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :style="{ '--value': `${((Number(modelValue) - min) / (max - min)) * 100}%` }"
      @input="emit('update:modelValue', Number($event.target.value))"
      @change="emit('change', $event)"
  /></label>
</template>
<style scoped lang="scss">
@use '../../styles/tokens' as *;
label {
  display: grid;
  gap: 12px;
}
span {
  @include readable-label;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
span b {
  color: $violet;
}
input {
  width: 100%;
  height: 10px;
  appearance: none;
  border-radius: 20px;
  outline: 0;
  background: linear-gradient(90deg, $violet var(--value), #e8e0d5 var(--value));
}
input::-webkit-slider-thumb {
  width: 24px;
  height: 24px;
  appearance: none;
  border: 4px solid white;
  border-radius: 50%;
  background: $violet;
  box-shadow: 0 2px 10px rgba(23, 19, 33, 0.26);
  cursor: grab;
}
input:focus-visible {
  @include focus-ring;
}
</style>
