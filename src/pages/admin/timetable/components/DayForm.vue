<template>
    <list-dialog-form
        ref="listDialogForm"
        v-model:dialog-open="dialogOpen"
        v-model:form-valid="formValid"
        :loading="loading"
        :create-mode="props.timetableDay === null"
        :title-text="`${props.timetableDay?.order}. ${props.timetableDay?.title}`"
        type-name="Timetable Day"
        @submit-form="submitForm"
        @delete="deleteTimetableDay"
    >
        <template #handle>
            <slot name="handle"></slot>
        </template>
        <template #form-fields>
            <v-text-field v-model="timetableDayRequest.title" :rules="rules.title" label="Title" counter="50"></v-text-field>
            <v-row no-gutters>
                <v-col class="mr-2">
                    <date-picker v-model="timetableDayRequest.startsAt" :text-field-props="{ prependIcon: 'mdi-calendar-start', label: 'Start Date', rules: rules.startDate }"></date-picker>
                </v-col>
                <v-col class="ml-2">
                    <time-picker v-model="timetableDayRequest.startsAt" :text-field-props="{ prependIcon: 'mdi-calendar-start', label: 'Start Time' }"></time-picker>
                </v-col>
            </v-row>
            <v-row no-gutters>
                <v-col class="mr-2">
                    <date-picker v-model="timetableDayRequest.endsAt" :text-field-props="{ prependIcon: 'mdi-calendar-start', label: 'End Date', rules: rules.startDate }"></date-picker>
                </v-col>
                <v-col class="ml-2">
                    <time-picker v-model="timetableDayRequest.endsAt" :text-field-props="{ prependIcon: 'mdi-calendar-start', label: 'End Time' }"></time-picker>
                </v-col>
            </v-row>
        </template>
    </list-dialog-form>
</template>

<script setup lang="ts">
import { computed, reactive, ref, type Ref, watch } from "vue"
import type { TimetableDay } from "@/types"
import type { TimetableDayRequest } from "@/types/requests/timetable-day.request"
import { DateTime } from "luxon"
import DatePicker from "@/components/DatePicker.vue"
import TimePicker from "@/components/TimePicker.vue"
import { HttpClientError, useHttpClient } from "@/plugins/api"
import { useMessageStore } from "@/plugins/pinia/message-store"
import ListDialogForm from "@/components/ListDialogForm.vue"

const api = useHttpClient()
const messageStore = useMessageStore()

interface Props {
    timetableDay: TimetableDay | null
}

const props: Props = withDefaults(defineProps<Props>(), {
    timetableDay: null,
})

const emit = defineEmits<{
    (e: "update:timetableDay", value: TimetableDay): void
    (e: "delete:timetable-day", value: TimetableDay): void
    (e: "day-created", value: TimetableDay): void
}>()

const dialogOpen: Ref<boolean> = ref<boolean>(false)
const formValid: Ref<boolean> = ref<boolean>(false)
const loading: Ref<boolean> = ref<boolean>(false)

const rules = {
    title: [(v: string) => !!v || "This field is required", (v: string) => v.length >= 3 || "Minimum 3 characters", (v: string) => v.length <= 50 || "Maximum 50 characters"],
    startDate: [(v: string) => !!v || "This field is required", () => startsAt.value < endsAt.value || "Start date must be before end date"],
    endDate: [(v: string) => !!v || "This field is required", () => endsAt.value > startsAt.value || "End date must be after start date"],
}

const timetableDayRequest: TimetableDayRequest = reactive<TimetableDayRequest>({
    title: "",
    startsAt: DateTime.now().setZone("UTC").toISO() ?? "",
    endsAt: DateTime.now().setZone("UTC").plus({ days: 1 }).toISO() ?? "",
})

watch(
    dialogOpen,
    (dialogOpen: boolean): void => {
        if (dialogOpen) {
            populateTimetableDayRequest()
        }
    },
    { immediate: true }
)

const startsAt = computed<DateTime>((): DateTime => DateTime.fromISO(timetableDayRequest.startsAt).setZone("Europe/Amsterdam"))
const endsAt = computed<DateTime>((): DateTime => DateTime.fromISO(timetableDayRequest.endsAt).setZone("Europe/Amsterdam"))

populateTimetableDayRequest()
function populateTimetableDayRequest(): void {
    timetableDayRequest.title = props.timetableDay?.title ?? ""
    timetableDayRequest.startsAt = props.timetableDay?.startsAt ?? DateTime.now().setZone("UTC").toISO() ?? ""
    timetableDayRequest.endsAt = props.timetableDay?.endsAt ?? DateTime.now().setZone("UTC").plus({ days: 1 }).toISO() ?? ""
}

function deleteTimetableDay(): void {
    if (props.timetableDay) {
        emit("delete:timetable-day", props.timetableDay)
    }
}

async function submitForm(): Promise<void> {
    if (!formValid.value) {
        return
    }

    loading.value = true
    try {
        if (props.timetableDay === null) {
            const newTimetableDay: TimetableDay = await api.timetableDayService.createTimetableDay(timetableDayRequest)

            messageStore.addMessage({
                text: "Timetable day created successfully",
                color: "success",
                timeout: 5000,
            })

            emit("day-created", newTimetableDay)
        } else {
            const updatedTimetableDay: TimetableDay = await api.timetableDayService.updateTimetableDay(props.timetableDay.id, timetableDayRequest)

            messageStore.addMessage({
                text: "Timetable day updated successfully",
                color: "success",
                timeout: 5000,
            })

            emit("update:timetableDay", updatedTimetableDay)
        }

        dialogOpen.value = false
    } catch (error) {
        if (error instanceof HttpClientError) {
            messageStore.addMessage({
                text: error.message,
                color: "error",
                timeout: 5000,
            })
        } else {
            console.error("Failed to save timetable day:", error)
        }
    } finally {
        loading.value = false
    }
}
</script>

<style scoped></style>
