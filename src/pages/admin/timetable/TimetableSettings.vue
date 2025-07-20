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
import { computed } from "vue"

interface Props {
    days: TimetableDay[]
}

const props = withDefaults(defineProps<Props>(), {
    days: () => [],
})

const emit = defineEmits<{
    (e: "update:days", value: TimetableDay[]): void
}>()

const timetableDays = computed({
    get: () => props.days,
    set: (value: TimetableDay[]) => emit("update:days", value),
})
</script>

<style scoped></style>
