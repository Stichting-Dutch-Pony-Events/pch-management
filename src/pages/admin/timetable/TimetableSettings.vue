<template>
    <v-row class="flex-grow-1 fill-height">
        <v-col>
            <location-overview :location-type="TimetableLocationType.ROOM" :timetable-days="timetableDays"></location-overview>
        </v-col>
        <v-col>
            <location-overview :location-type="TimetableLocationType.VOLUNTEER_POST" :timetable-days="timetableDays"></location-overview>
        </v-col>
        <v-col>
            <days-overview v-model:timetable-days="timetableDays" />
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import DaysOverview from "@/pages/admin/timetable/components/DaysOverview.vue"
import LocationOverview from "@/pages/admin/timetable/components/LocationOverview.vue"
import { type TimetableDay, TimetableLocationType } from "@/types"
import { useHttpClient } from "@/plugins/api"
import { type Ref, ref } from "vue"

const api = useHttpClient()

const timetableDays: Ref<TimetableDay[]> = ref<TimetableDay[]>([])
void fetchTimetableDays()
async function fetchTimetableDays(): Promise<void> {
    timetableDays.value = await api.timetableDayService.getTimetableDays()
}
</script>

<style scoped></style>
