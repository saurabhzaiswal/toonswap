<script setup>
defineProps({ variant: { type: String, default: 'primary' }, type: { type: String, default: 'button' }, disabled: Boolean, block: Boolean });
</script>
<template><button :type="type" :disabled="disabled" :class="[variant, { block }]"><slot /><span v-if="$slots.icon" class="icon"><slot name="icon" /></span></button></template>
<style scoped lang="scss">
@use '../../styles/tokens' as *;
button { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 52px; padding: 13px 20px; border: 1.5px solid transparent; border-radius: 15px; font: inherit; font-weight: 850; cursor: pointer; transition: transform .18s ease, box-shadow .18s ease, background .18s ease; }
button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(23, 19, 33, .14); }
button:focus-visible { @include focus-ring; }
.primary { color: white; background: $ink; }
.accent { color: $ink; background: $gold; border-color: $ink; }
.coral { color: white; background: $coral; }
.secondary { color: $ink; background: white; border-color: $line; }
.ghost { color: $ink; background: transparent; border-color: transparent; }
.danger { color: #a72d25; background: #fff1ee; border-color: #f1c2bb; }
.block { width: 100%; }
button:disabled { cursor: not-allowed; opacity: .48; }
.icon { display: inline-grid; place-items: center; }
</style>
