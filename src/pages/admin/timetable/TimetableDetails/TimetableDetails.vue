<template>
    <div class="scroll-container">
        <v-card
            v-for="item in availableLocations"
            :key="item.timetableLocation.id"
            :class="{
                'snap-card': true,
                'fill-height': true,
            }"
            width="384px"
            :loading="isLoading"
        >
            <v-card-item>
                <div class="d-flex align-center justify-space-between" style="width: 100%">
                    <v-card-title class="pa-0">{{ item.timetableLocation.title }}</v-card-title>
                    <timetable-item-form
                        v-if="selectedDay"
                        :timetable-item="null"
                        :timetable-location="item.timetableLocation"
                        :timetable-day="selectedDay"
                        :allow-attendee-attachment="allowAttendeeAttachment"
                        @timetable-item-created="timetableItemCreated"
                    >
                        <template #activator="{ props }">
                            <v-btn v-bind="props" color="primary" icon="mdi-plus" density="compact" variant="text" />
                        </template>
                    </timetable-item-form>
                </div>
            </v-card-item>

            <location-day-timeline
                v-if="selectedDay"
                :timetable-day="selectedDay"
                :timetable-location="item.timetableLocation"
                :events="item.items"
                :allow-attendee-attachment="allowAttendeeAttachment"
                @update:timetable-item="timetableItemUpdated"
                @delete:timetable-item="deleteTimetableItem"
            ></location-day-timeline>
        </v-card>
    </div>
</template>

<script setup lang="ts">
import { type TimetableDay, type TimetableItem, type TimetableLocation, TimetableLocationType } from "@/types"
import { computed, type ComputedRef, onMounted, reactive, ref, type Ref, watch } from "vue"
import { HttpClientError, useHttpClient } from "@/plugins/api"
import { useRoute } from "vue-router"
import LocationDayTimeline from "@/pages/admin/timetable/TimetableDetails/LocationDayTimeline.vue"
import TimetableItemForm from "@/pages/admin/timetable/TimetableDetails/TimetableItemForm.vue"
import { useMessageStore } from "@/plugins/pinia/message-store"

const api = useHttpClient()
const route = useRoute()
const messageStore = useMessageStore()

interface Props {
    timetableLocationType: TimetableLocationType
    timetableDays: TimetableDay[]
    allowAttendeeAttachment: boolean
}

const props = withDefaults(defineProps<Props>(), {
    timetableLocationType: TimetableLocationType.ROOM,
    timetableDays: () => [],
    allowAttendeeAttachment: false,
})

const locations: Ref<TimetableLocation[]> = ref<TimetableLocation[]>([])
const timetableItems: Ref<TimetableItem[]> = ref<TimetableItem[]>([])
const loading = reactive({
    locations: false,
    items: false,
    other: false,
})

const isLoading = computed(() => {
    return Object.values(loading).some((value) => value)
})

const selectedDay: ComputedRef<TimetableDay | null> = computed(() => {
    const dayId = route.params.timetableDay as string
    return props.timetableDays.find((day) => day.id === dayId) ?? null
})

watch(
    () => selectedDay.value,
    (newDay) => {
        if (newDay) {
            void fetchTimetableItems()
        }
    },
    { immediate: true }
)

interface LocationColumn {
    timetableLocation: TimetableLocation
    items: TimetableItem[]
}
const availableLocations: ComputedRef<LocationColumn[]> = computed(() => {
    if (selectedDay.value === null) {
        return []
    }

    const availableLocations = locations.value.filter((location) =>
        location.timetableDays.some((day) => day.id === selectedDay.value!.id)
    )
    return availableLocations.map((location) => {
        return {
            timetableLocation: location,
            items: timetableItems.value.filter((item) => item.timetableLocationId === location.id),
        }
    })
})

void fetchTimetableLocations()
async function fetchTimetableLocations() {
    loading.locations = true
    try {
        locations.value = await api.timetableLocationService.getTimetableLocations(props.timetableLocationType)
    } catch (error) {
        console.error("Failed to fetch timetable locations:", error)
    } finally {
        loading.locations = false
    }
}

async function fetchTimetableItems() {
    if (selectedDay.value === null) {
        return
    }

    loading.items = true
    try {
        timetableItems.value = await api.timetableItemService.getTimetableItems(
            selectedDay.value.id,
            props.timetableLocationType
        )
    } catch (error) {
        console.error("Failed to fetch timetable items:", error)
    } finally {
        loading.items = false
    }
}

function timetableItemUpdated(timetableItem: TimetableItem): void {
    const index = timetableItems.value.findIndex((item) => item.id === timetableItem.id)
    if (index >= 0) {
        timetableItems.value[index] = timetableItem
        timetableItems.value.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    }
}

function timetableItemCreated(timetableItem: TimetableItem): void {
    timetableItems.value.push(timetableItem)
    timetableItems.value.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
}

async function deleteTimetableItem(item: TimetableItem): Promise<void> {
    try {
        loading.items = true
        await api.timetableItemService.deleteTimetableItem(item.id)
        timetableItems.value = timetableItems.value.filter((ti) => ti.id !== item.id)

        messageStore.addMessage({
            color: "success",
            text: `Timetable Item "${item.title}" deleted successfully.`,
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
        loading.items = false
    }
}

onMounted(() => {
    const el = document.querySelector(".scroll-container") as HTMLElement
    let isDown = false
    let startX = 0
    let scrollLeft = 0

    el.addEventListener("mousedown", (e) => {
        isDown = true
        el.classList.add("dragging")
        startX = e.pageX - el.offsetLeft
        scrollLeft = el.scrollLeft
    })

    el.addEventListener("mouseleave", () => {
        isDown = false
        el.classList.remove("dragging")
    })

    el.addEventListener("mouseup", () => {
        isDown = false
        el.classList.remove("dragging")
    })

    el.addEventListener("mousemove", (e) => {
        if (!isDown) return
        e.preventDefault()
        const x = e.pageX - el.offsetLeft
        const walk = (x - startX) * 2 // scroll speed
        el.scrollLeft = scrollLeft - walk
    })
})
</script>

<style scoped>
.scroll-container {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    gap: 16px;
    cursor: grab;
    height: 100%;
}

.scroll-container:active {
    cursor: grabbing;
}

.snap-card {
    scroll-snap-align: start;
    flex-shrink: 0;
    height: 100%; /* or a specific height */
}
</style>
