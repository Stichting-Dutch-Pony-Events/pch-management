<template>
    <v-text-field prepend-icon="mdi-palette" label="Colour" :model-value="props.modelValue" readonly>
        <template v-slot:append-inner>
            <v-icon :style="{ color: props.modelValue }" size="x-large">mdi-circle</v-icon>
        </template>
        <v-menu
            v-model="pickerOpen"
            :close-on-content-click="false"
            :close-on-back="true"
            activator="parent"
            transition="scale-transition"
        >
            <v-color-picker
                v-model="colour"
                class="ma-2"
                swatches-max-height="400px"
                show-swatches
                mode="hex"
            ></v-color-picker>
        </v-menu>
    </v-text-field>
</template>

<script setup lang="ts">
import { computed, ref, type Ref } from "vue"

interface Props {
    modelValue: string
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: "#ff9e5a",
})
const pickerOpen: Ref<boolean> = ref<boolean>(false)

const emit = defineEmits<{
    (e: "update:modelValue", value: string): void
}>()

const colour = computed<string>({
    get(): string {
        return props.modelValue
    },
    set(value: string): void {
        emit("update:modelValue", value)
    },
})
</script>

<style scoped></style>
