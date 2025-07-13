<template>
    <v-text-field v-bind="props.textFieldProps" :model-value="time" readonly>
        <v-menu v-model="pickerOpen" :close-on-content-click="false" activator="parent" transition="scale-transition">
            <v-time-picker v-bind="timePickerProps" v-if="pickerOpen" v-model="time" format="24hr" full-width @update:minute="pickerOpen = false">
                <template #actions>
                    <v-btn @click="pickerOpen = false">Close</v-btn>
                </template>
            </v-time-picker>
        </v-menu>
    </v-text-field>
</template>

<script setup lang="ts">
import { DateTime } from "luxon"
import { VTextField, VTimePicker } from "vuetify/components"
import { computed, type ComputedRef, type Ref, ref } from "vue"

type TextFieldProps = Partial<InstanceType<typeof VTextField>["$props"]>
type TimePickerProps = Partial<InstanceType<typeof VTimePicker>["$props"]>

interface Props {
    modelValue: string
    textFieldProps?: TextFieldProps
    timePickerProps?: TimePickerProps
}

const emit = defineEmits<{
    (e: "update:modelValue", value: string): void
}>()

const time: ComputedRef<string> = computed({
    get(): string {
        return DateTime.fromISO(props.modelValue).setZone("Europe/Amsterdam").toLocaleString(DateTime.TIME_24_SIMPLE)
    },
    set(value: string): void {
        console.log(value)
        const date = DateTime.fromISO(props.modelValue).setZone("Europe/Amsterdam")
        emit(
            "update:modelValue",
            date
                .set({ hour: parseInt(value.split(":")[0]), minute: parseInt(value.split(":")[1]), second: 0 })
                .setZone("UTC")
                .toISO() ?? ""
        )
    },
})

const props = defineProps<Props>()
const pickerOpen: Ref<boolean> = ref<boolean>(false)
</script>

<style scoped></style>
