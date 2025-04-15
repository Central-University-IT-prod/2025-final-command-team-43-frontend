<script setup>

const props = defineProps({
    modelValue: [String,Number]
})

const emits = defineEmits(
    ['update:modelValue']
)

</script>

<template>
    <input type="text" :value = "modelValue" @input="emits('update:modelValue',$event.target.value)">
</template>

<style scoped>
input{
    padding: 0.35rem 1rem;
    font-size: 1rem;
    border-radius: 0.25rem;
    border: 0.1rem solid var(--main-color);
    outline: 0;
    max-width: 70vw;
}
input:focus{
    border: 0.125rem solid var(--main-color);
}
</style>