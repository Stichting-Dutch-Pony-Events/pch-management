<template>
    <v-dialog v-model="dialogOpen" max-width="512px" persistent>
        <template v-slot:activator>
            <v-divider v-if="props.timetableDay !== null"></v-divider>
            <v-list-item @click="dialogOpen = true">
                <template v-slot:prepend>
                    <v-icon v-if="props.timetableDay === null">mdi-plus</v-icon>
                    <slot name="handle"></slot>
                </template>
                <v-list-item-title v-if="props.timetableDay === null">Create Day</v-list-item-title>
                <v-list-item-title v-else>
                    {{ props.timetableDay?.order }}. {{ props.timetableDay?.title }} -
                    <span class="text-caption">({{ startsAt.toLocaleString(DateTime.DATETIME_MED) }} - {{ endsAt.toLocaleString(DateTime.DATETIME_MED) }})</span>
                </v-list-item-title>
                <template v-slot:append>
                    <confirm-dialog
                        v-if="props.timetableDay !== null"
                        :message="`You will be deleting the Timetable Day: ${props.timetableDay.title}`"
                        @confirm="$emit('delete:timetable-day', props.timetableDay)"
                    />
                </template>
            </v-list-item>
        </template>

        <template v-slot:default="{ isActive }">
            <v-form v-model="formValid" @submit.prevent="submitForm">
                <v-card :loading="loading">
                    <v-card-item>
                        <v-card-title v-if="props.timetableDay === null">Create Day</v-card-title>
                        <v-card-title v-else>Edit Day</v-card-title>
                    </v-card-item>

                    <v-card-text>
                        <v-text-field v-model="timetableDayRequest.title" :rules="rules.title" label="Title" counter="50"></v-text-field>
                        <v-row no-gutters>
                            <v-col class="mr-2">
                                <date-picker
                                    v-model="timetableDayRequest.startsAt"
                                    :text-field-props="{ prependIcon: 'mdi-calendar-start', label: 'Start Date', rules: rules.startDate }"
                                ></date-picker>
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
                    </v-card-text>

                    <template v-slot:actions>
                        <v-btn @click="isActive.value = false">Cancel</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn type="submit" :disabled="loading">Save</v-btn>
                    </template>
                </v-card>
            </v-form>
        </template>
    </v-dialog>
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
import ConfirmDialog from "@/components/ConfirmDialog.vue"

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
