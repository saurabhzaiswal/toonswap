<script setup>
import { computed } from 'vue';
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from '@headlessui/vue';
import { nextUiId } from './id';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, required: true },
  id: { type: String, default: '' },
  options: { type: Array, required: true },
  hint: { type: String, default: '' },
  placeholder: { type: String, default: 'Choose an option' },
  disabled: Boolean,
});
const emit = defineEmits(['update:modelValue', 'change']);
const controlId = props.id || nextUiId('toon-select');
const optionValue = (option) => typeof option === 'object' ? option.value : option;
const optionLabel = (option) => typeof option === 'object' ? option.label : option;
const optionDescription = (option) => typeof option === 'object' ? option.description : '';
const optionAvatar = (option) => typeof option === 'object' ? option.avatar : '';
const optionAvatarStyle = (option) => typeof option === 'object' ? option.avatarStyle : null;
const selected = computed(() => props.options.find((option) => optionValue(option) === props.modelValue));
const model = computed({
  get: () => props.modelValue,
  set: (value) => { emit('update:modelValue', value); emit('change', value); },
});
</script>

<template>
  <Listbox v-slot="{ open }" v-model="model" :disabled="disabled" as="div" class="field">
    <ListboxLabel :id="`${controlId}-label`" class="label">{{ label }}</ListboxLabel>
    <ListboxButton :id="controlId" class="trigger" :aria-describedby="hint ? `${controlId}-help` : undefined">
      <span v-if="selected && (optionAvatar(selected) || optionAvatarStyle(selected))" class="avatar" :style="optionAvatarStyle(selected)"><img v-if="optionAvatar(selected)" :src="optionAvatar(selected)" alt="" /></span>
      <span class="value"><b>{{ selected ? optionLabel(selected) : placeholder }}</b><small v-if="selected && optionDescription(selected)">{{ optionDescription(selected) }}</small></span>
      <i :class="{ open }" aria-hidden="true"></i>
    </ListboxButton>
    <Transition name="dropdown">
      <ListboxOptions class="options">
        <ListboxOption v-for="option in options" v-slot="{ active, selected: isSelected }" :key="optionValue(option)" :value="optionValue(option)" as="template">
          <li :class="{ selected: isSelected, highlighted: active }">
            <span v-if="optionAvatar(option) || optionAvatarStyle(option)" class="avatar" :style="optionAvatarStyle(option)"><img v-if="optionAvatar(option)" :src="optionAvatar(option)" alt="" /></span>
            <span class="option-copy"><b>{{ optionLabel(option) }}</b><small v-if="optionDescription(option)">{{ optionDescription(option) }}</small></span>
            <strong aria-hidden="true">{{ isSelected ? '✓' : '' }}</strong>
          </li>
        </ListboxOption>
      </ListboxOptions>
    </Transition>
    <small v-if="hint" :id="`${controlId}-help`" class="hint">{{ hint }}</small>
  </Listbox>
</template>

<style scoped lang="scss">
@use '../../styles/tokens' as *;
.field { position: relative; display: grid; gap: 8px; min-width: 0; }.label { @include readable-label; }.trigger { display: grid; grid-template-columns: auto minmax(0, 1fr) 18px; gap: 11px; align-items: center; width: 100%; min-height: 56px; padding: 9px 15px; text-align: left; border: 1.5px solid $line; border-radius: $radius-sm; color: $ink; background: $paper; font: inherit; cursor: pointer; transition: border-color .16s ease, box-shadow .16s ease, transform .08s ease; }.trigger:hover { border-color: color-mix(in srgb, #{$violet} 55%, #{$line}); }.trigger:active { transform: translateY(1px) scale(.996); }.trigger:focus-visible, .trigger[aria-expanded="true"] { border-color: $violet; @include focus-ring; }.trigger:disabled { cursor: not-allowed; opacity: .52; }.value, .option-copy { display: grid; gap: 2px; min-width: 0; }.value b, .option-copy b { overflow: hidden; font-size: 1rem; text-overflow: ellipsis; white-space: nowrap; }.value small, .option-copy small { overflow: hidden; color: $muted; font-size: .8rem; text-overflow: ellipsis; white-space: nowrap; }.trigger > i { width: 10px; height: 10px; border-right: 2px solid $ink; border-bottom: 2px solid $ink; transform: translateY(-3px) rotate(45deg); transition: transform .18s ease; }.trigger > i.open { transform: translateY(3px) rotate(225deg); }.avatar { flex: 0 0 auto; display: block; width: 38px; height: 38px; overflow: hidden; border-radius: 11px; background-color: var(--color-secondary-soft); background-repeat: no-repeat; }.avatar img { width: 100%; height: 100%; object-fit: cover; }.options { position: absolute; z-index: 80; inset: calc(100% - 2px) 0 auto; max-height: 330px; margin: 0; padding: 7px; overflow-y: auto; list-style: none; border: 1.5px solid $ink; border-radius: 16px; background: $paper; box-shadow: $shadow-lift; outline: none; }.options li { display: grid; grid-template-columns: auto minmax(0, 1fr) 22px; gap: 11px; align-items: center; min-height: 52px; padding: 8px 10px; border-radius: 11px; cursor: pointer; }.options li:not(:last-child) { margin-bottom: 2px; }.options li.highlighted { background: var(--color-soft); }.options li.selected { color: white; background: $violet; }.options li.selected small { color: color-mix(in srgb, white 75%, #{$violet}); }.options strong { text-align: center; }.hint { color: $muted; font-size: .82rem; line-height: 1.4; }.dropdown-enter-active, .dropdown-leave-active { transition: opacity .15s ease, transform .15s ease; transform-origin: top; }.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-5px) scale(.985); }
</style>
