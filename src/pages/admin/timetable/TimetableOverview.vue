<template>
    <div class="d-flex flex-column fill-height w-100">
        <v-toolbar class="mb-4">
            <v-toolbar-title style="max-width: 300px; flex: inherit">
                <v-icon>mdi-timeline-clock</v-icon>
                Schedules
            </v-toolbar-title>

            <v-divider vertical class="ml-10"></v-divider>
            <v-tabs>
                <v-tab text="Public Schedule" prepend-icon="mdi-calendar-star" :to="{ name: 'publicTimetable', params: { timetableDay: dayId } }"></v-tab>
                <v-divider vertical></v-divider>
                <v-tab text="Volunteer Schedules" prepend-icon="mdi-calendar-account" :to="{ name: 'volunteerTimetable', params: { timetableDay: dayId } }"></v-tab>
                <v-divider vertical></v-divider>
                <v-tab text="Settings" prepend-icon="mdi-cog" :to="{ name: 'timetableSettings' }"></v-tab>
            </v-tabs>
            <v-divider vertical class="mr-10"></v-divider>
            <template v-if="showDayTabs" #extension>
                <div class="d-flex flex-grow-1" style="border-top: 1px solid rgba(255, 255, 255, 0.12)">
                    <v-progress-linear indeterminate v-if="loadingDays" class="mx-5"></v-progress-linear>
                    <v-tabs v-if="!loadingDays">
                        <v-tab v-for="day in days" :key="day.id" :to="{ name: route.name, params: { timetableDay: day.id } }">{{ day.title }}</v-tab>
                    </v-tabs>
                </div>
            </template>
        </v-toolbar>
        <router-view v-model:days="days"></router-view>
    </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router"
import { computed, ref, type Ref } from "vue"
import type { TimetableDay } from "@/types"
import { useHttpClient } from "@/plugins/api"

const route = useRoute()
const router = useRouter()
const api = useHttpClient()

const showDayTabs = computed(() => {
    return route.name === "publicTimetable" || route.name === "volunteerTimetable"
})

const days: Ref<TimetableDay[]> = ref<TimetableDay[]>([])
const loadingDays: Ref<boolean> = ref(false)

const dayId = computed(() => {
    if (route.params.timetableDay) {
        return route.params.timetableDay as string
    }

    if (days.value.length > 0) {
        return days.value[0].id
    }

    return undefined
})

void fetchTimetableDays()
async function fetchTimetableDays(): Promise<void> {
    loadingDays.value = true
    try {
        days.value = await api.timetableDayService.getTimetableDays()

        if (route.params.timetableDay === undefined && (route.name === "publicTimetable" || route.name === "volunteerTimetable")) {
            void router.push({
                name: route.name,
                params: { timetableDay: days.value[0]?.id },
            })
        }
    } catch (error) {
        console.error("Failed to fetch timetable days:", error)
    } finally {
        loadingDays.value = false
    }
}
</script>

<style scoped></style>
