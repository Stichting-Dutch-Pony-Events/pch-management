<template>
    <v-text-field v-bind="props.textFieldProps" :model-value="date.toLocaleString(DateTime.DATE_MED)" readonly>
        <v-menu v-model="pickerOpen" :close-on-content-click="false" activator="parent" transition="scale-transition">
            <v-date-picker v-bind="datePickerProps" v-if="pickerOpen" v-model="date" @update:model-value="pickerOpen = false" full-width show-adjacent-months>
                <template #actions>
                    <v-btn @click="pickerOpen = false">Close</v-btn>
                </template>
            </v-date-picker>
        </v-menu>
    </v-text-field>
</template>

<script setup lang="ts">
import { DateTime } from "luxon"
import { VDatePicker, VTextField } from "vuetify/components"
import { computed, type Ref, ref } from "vue"

type TextFieldProps = Partial<InstanceType<typeof VTextField>["$props"]>
type DatePickerProps = Partial<InstanceType<typeof VDatePicker>["$props"]>

interface Props {
    modelValue: string
    textFieldProps?: TextFieldProps
    datePickerProps?: DatePickerProps
}

const emit = defineEmits<{
    (e: "update:modelValue", value: string): void
}>()

const date = computed<DateTime>({
    get(): DateTime {
        return DateTime.fromISO(props.modelValue).setZone("Europe/Amsterdam")
    },
    set(value: DateTime): void {
        const date: DateTime = DateTime.fromISO(props.modelValue).setZone("Europe/Amsterdam")
        date.set({ year: value.year, month: value.month, day: value.day })
        emit("update:modelValue", date.set({ year: value.year, month: value.month, day: value.day }).setZone("UTC").toISO() ?? "")
    },
})

const props = defineProps<Props>()
const pickerOpen: Ref<boolean> = ref<boolean>(false)
</script>

<style scoped></style>
