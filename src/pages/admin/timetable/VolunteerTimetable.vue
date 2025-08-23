<template>
    <timetable-details
        :timetable-location-type="TimetableLocationType.VOLUNTEER_POST"
        :timetable-days="props.days"
        :allow-attendee-attachment="true"
    />
</template>

<script setup lang="ts">
import { type TimetableDay, TimetableLocationType } from "@/types"
import TimetableDetails from "@/pages/admin/timetable/TimetableDetails/TimetableDetails.vue"

interface Props {
    days: TimetableDay[]
}

const props = withDefaults(defineProps<Props>(), {
    days: () => [],
})
</script>

<style scoped></style>
