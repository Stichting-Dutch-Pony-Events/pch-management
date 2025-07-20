<template>
    <div class="timetable">
        <div class="time-column">
            <div v-for="(time, i) in timeSlots" :key="i" class="time-label">
                <span>{{ time }}</span>
                <hr />
            </div>
        </div>

        <div class="schedule-column">
            <!-- background lines -->
            <div v-for="(interval, i) in timeIntervals" :key="'line-' + i" class="background-line" :style="{ top: `${i * 30}px` }" />

            <!-- events -->
            <timetable-item-form
                v-for="event in positionedEvents"
                :key="event.timetableItem.id"
                :timetable-location="props.timetableLocation"
                :timetable-day="props.timetableDay"
                :timetable-item="event.timetableItem"
                :top-offset="event.top"
                :height="event.height"
                @update:timetable-item="timetableItemUpdated"
                @delete:timetable-item="timetableItemDeleted"
            ></timetable-item-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { TimetableDay, TimetableItem, TimetableLocation } from "@/types"
import { computed } from "vue"
import { DateTime } from "luxon"
import TimetableItemForm from "@/pages/admin/timetable/TimetableDetails/TimetableItemForm.vue"

interface Props {
    timetableDay: TimetableDay
    timetableLocation: TimetableLocation
    events: TimetableItem[]
}

const props = withDefaults(defineProps<Props>(), {
    events: () => [],
})

const emit = defineEmits<{
    (e: "update:timetable-item", value: TimetableItem): void
    (e: "delete:timetable-item", value: TimetableItem): void
}>()

const startTime = computed(() => {
    return DateTime.fromISO(props.timetableDay.startsAt).setZone("Europe/Amsterdam")
})

const endTime = computed(() => {
    return DateTime.fromISO(props.timetableDay.endsAt).setZone("Europe/Amsterdam")
})

const timeSlots = computed(() => {
    const slots: string[] = []
    let currentTime = startTime.value

    while (currentTime <= endTime.value) {
        slots.push(currentTime.toFormat("HH:mm"))
        currentTime = currentTime.plus({ minutes: 30 }) // 30-minute intervals
    }
    return slots
})

const timeIntervals = computed(() => {
    const intervals: DateTime[] = []
    const interValEndTime: DateTime = endTime.value.plus({ minutes: 15 })
    let currentTime = startTime.value

    while (currentTime <= interValEndTime) {
        intervals.push(currentTime)
        currentTime = currentTime.plus({ minutes: 15 })
    }
    return intervals
})

interface PositionedEvent {
    top: number
    height: number
    timetableItem: TimetableItem
}

const positionedEvents = computed((): PositionedEvent[] => {
    const events: PositionedEvent[] = []
    const pixelsPerMinute = 2

    for (const event of props.events) {
        const start = DateTime.fromISO(event.startTime).setZone("Europe/Amsterdam")
        const end = DateTime.fromISO(event.endTime).setZone("Europe/Amsterdam")

        const startOffset = start.diff(startTime.value, "minutes").minutes
        const duration = end.diff(start, "minutes").minutes

        if (start < startTime.value || end > endTime.value) {
            continue // Skip events outside the day's range
        }

        events.push({
            top: startOffset * pixelsPerMinute,
            height: duration * pixelsPerMinute,
            timetableItem: event,
        })
    }

    return events
})

function timetableItemUpdated(timetableItem: TimetableItem): void {
    emit("update:timetable-item", timetableItem)
}

function timetableItemDeleted(timetableItem: TimetableItem): void {
    emit("delete:timetable-item", timetableItem)
}
</script>

<style scoped>
.timetable {
    display: flex;
    max-height: 1000px;
    overflow-y: auto;
    position: relative;
    font-family: sans-serif;
}

.time-column {
    margin-top: 20px;
    width: 80px;
}

.time-label {
    display: flex; /* 👈 makes <span> and <hr> sit side by side */
    align-items: center; /* 👈 vertical alignment */
    gap: 0.5em; /* 👈 spacing between time and line */
    height: 60px;
    padding: 0.25rem;
    font-size: 0.85rem;
    text-align: left;
    border-right: 1px solid #ddd;
    box-sizing: border-box;
}

.time-label hr {
    flex: 1; /* 👈 hr stretches to fill remaining space */
    border: none;
    border-top: 1px solid #eee;
    margin: 0;
}

.schedule-column {
    margin-top: 50px;
    position: relative;
    flex: 1;
}

.background-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background-color: rgba(61, 61, 61, 0.5);
    z-index: 0; /* 👈 push background lines behind */
}
</style>
