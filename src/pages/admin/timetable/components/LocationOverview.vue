<template>
    <v-card class="fill-height" :loading="loading">
        <v-card-item>
            <v-card-title>{{ title }}</v-card-title>
        </v-card-item>
        <v-list>
            <location-form :location-type="props.locationType" :timetable-location="null" :timetable-days="timetableDays" @timetable-location-created="createdLocation"></location-form>
            <draggable v-model="locations" @change="orderChanged" item-key="id" tag="div" animation="200" handle=".drag-handle">
                <template #item="{ element: location, index }">
                    <div>
                        <location-form
                            :timetable-location="location"
                            :location-type="props.locationType"
                            :timetable-days="timetableDays"
                            @update:timetable-location="(value) => (locations[index] = value)"
                            @delete:timetable-location="deleteTimetableLocation"
                        >
                            <template v-slot:handle>
                                <v-icon :class="{ 'drag-handle': !loading }" v-show="!loading">mdi-drag</v-icon>
                                <v-progress-circular indeterminate v-if="loading" size="16"></v-progress-circular>
                            </template>
                        </location-form>
                    </div>
                </template>
            </draggable>
        </v-list>
    </v-card>
</template>

<script setup lang="ts">
import draggable from "vuedraggable"
import { type ChangeOrderRequest, type TimetableDay, type TimetableLocation, TimetableLocationType } from "@/types"
import { HttpClientError, useHttpClient } from "@/plugins/api"
import { useMessageStore } from "@/plugins/pinia/message-store"
import { computed, type ComputedRef, type Ref, ref } from "vue"
import LocationForm from "@/pages/admin/timetable/components/LocationForm.vue"

const api = useHttpClient()
const messageStore = useMessageStore()

interface Props {
    locationType: TimetableLocationType
    timetableDays: TimetableDay[]
}

const props = withDefaults(defineProps<Props>(), {
    locationType: TimetableLocationType.ROOM,
    timetableDays: () => [],
})

const loading: Ref<boolean> = ref<boolean>(false)
const locations: Ref<TimetableLocation[]> = ref<TimetableLocation[]>([])

const title: ComputedRef<string> = computed(() => {
    switch (props.locationType) {
        case TimetableLocationType.VOLUNTEER_POST:
            return "Volunteer Posts"
        default:
            return "Rooms"
    }
})

void getLocations()
async function getLocations() {
    loading.value = true
    try {
        locations.value = await api.timetableLocationService.getTimetableLocations(props.locationType)
    } catch (error) {
        if (error instanceof HttpClientError) {
            messageStore.addMessage({
                color: "error",
                text: `Failed to load locations: ${error.message}`,
                timeout: 5000,
            })
        }
    } finally {
        loading.value = false
    }
}

async function deleteTimetableLocation(location: TimetableLocation): Promise<void> {
    try {
        loading.value = true
        await api.timetableLocationService.deleteTimetableLocation(location.id)
        locations.value = locations.value.filter((q) => q.id !== location.id)

        messageStore.addMessage({
            color: "success",
            text: `Location "${location.title}" deleted successfully.`,
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

async function orderChanged(): Promise<void> {
    const changeOrderRequest: ChangeOrderRequest = {
        ids: [],
    }

    for (let index = 0; index < locations.value.length; index++) {
        locations.value[index].order = index + 1
        changeOrderRequest.ids.push(locations.value[index].id)
    }

    try {
        loading.value = true
        await api.timetableLocationService.changeTimetableLocationOrder(changeOrderRequest)
    } finally {
        loading.value = false
    }
}

function createdLocation(location: TimetableLocation): void {
    locations.value.push(location)
}
</script>

<style scoped></style>
