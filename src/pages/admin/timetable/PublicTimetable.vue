<template>
    <timetable-details
        :timetable-location-type="TimetableLocationType.ROOM"
        :timetable-days="props.days"
        :allow-attendee-attachment="false"
    />
</template>

<script setup lang="ts">
import TimetableDetails from "@/pages/admin/timetable/TimetableDetails/TimetableDetails.vue"
import { type TimetableDay, TimetableLocationType } from "@/types"

interface Props {
    days: TimetableDay[]
}

const props = withDefaults(defineProps<Props>(), {
    days: () => [],
})
</script>

<style scoped></style>
