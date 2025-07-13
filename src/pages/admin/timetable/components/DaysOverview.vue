<template>
    <v-card class="fill-height" :loading="loading">
        <v-card-item>
            <v-card-title>Days</v-card-title>
        </v-card-item>
        <v-card-text> Convention days for the timetable. Timezones are forced to Europe/Amsterdam and are converted to UTC for storage. </v-card-text>
        <v-list>
            <day-form :timetable-day="null" @day-created="addDay"></day-form>
            <draggable v-model="days" @change="orderChanged" item-key="id" tag="div" animation="200" handle=".drag-handle">
                <template #item="{ element: day, index }">
                    <div>
                        <day-form :timetable-day="day" :key="day.id" @update:timetable-day="(value) => (days[index] = value)" @delete:timetable-day="deleteTimetableDay">
                            <template v-slot:handle>
                                <v-icon :class="{ 'drag-handle': !loading }" v-show="!loading">mdi-drag</v-icon>
                                <v-progress-circular indeterminate v-if="loading" size="16"></v-progress-circular>
                            </template>
                        </day-form>
                    </div>
                </template>
            </draggable>
        </v-list>
    </v-card>
</template>

<script setup lang="ts">
import DayForm from "@/pages/admin/timetable/components/DayForm.vue"
import { HttpClientError, useHttpClient } from "@/plugins/api"
import { type Ref, ref } from "vue"
import type { TimetableDay } from "@/types"
import draggable from "vuedraggable"
import type { ChangeOrderRequest } from "@/types/requests/change-order.request"
import { useMessageStore } from "@/plugins/pinia/message-store"

const api = useHttpClient()
const messageStore = useMessageStore()

const days: Ref<TimetableDay[]> = ref<TimetableDay[]>([])
const loading: Ref<boolean> = ref<boolean>(false)

void getTimetableDays()
async function getTimetableDays(): Promise<void> {
    try {
        loading.value = true
        days.value = await api.timetableDayService.getTimetableDays()
    } finally {
        loading.value = false
    }
}

async function orderChanged(): Promise<void> {
    const changeOrderRequest: ChangeOrderRequest = {
        ids: [],
    }

    for (let index = 0; index < days.value.length; index++) {
        days.value[index].order = index + 1
        changeOrderRequest.ids.push(days.value[index].id)
    }

    try {
        loading.value = true
        await api.timetableDayService.changeTimetableDayOrder(changeOrderRequest)
    } finally {
        loading.value = false
    }
}

async function deleteTimetableDay(day: TimetableDay): Promise<void> {
    try {
        loading.value = true
        await api.timetableDayService.deleteTimetableDay(day.id)
        days.value = days.value.filter((q) => q.id !== day.id)

        messageStore.addMessage({
            color: "success",
            text: `Day "${day.title}" deleted successfully.`,
            timeout: 3000,
        })
    } catch (error) {
        if (error instanceof HttpClientError) {
            messageStore.addMessage({
                color: "error",
                text: error.message,
                timeout: 5000,
            })
            return
        }
        console.error("Failed to delete question:", error)
    } finally {
        loading.value = false
    }
}

function addDay(day: TimetableDay): void {
    days.value.push(day)
}
</script>

<style scoped></style>
