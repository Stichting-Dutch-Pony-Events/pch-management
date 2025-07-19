<template>
    <list-dialog-form
        ref="listDialogForm"
        v-model:dialog-open="dialogOpen"
        v-model:form-valid="formValid"
        :create-mode="props.timetableLocation === null"
        :type-name="typeText"
        :title-text="props.timetableLocation?.title ?? ''"
        :loading="loading"
        @submit-form="submitForm"
        @delete="deleteLocation"
    >
        <template #handle>
            <slot name="handle"></slot>
        </template>
        <template #title>
            {{ props.timetableLocation?.order }}. {{ props.timetableLocation?.title }}
            <span class="text-caption">({{ daysText }})</span>
        </template>
        <template #form-fields>
            <v-text-field v-model="timetableLocationRequest.title" label="Title" counter="50" :rules="rules.title"></v-text-field>
            <span class="text-subtitle-1 mt-2">Enable on Timetable Days</span>
            <v-checkbox
                v-for="day in props.timetableDays"
                :key="day.id"
                v-model="timetableLocationRequest.timetableDays"
                :value="day.id"
                :label="day.title"
                hide-details
                density="compact"
            ></v-checkbox>
        </template>
    </list-dialog-form>
</template>

<script setup lang="ts">
import { type TimetableDay, type TimetableLocation, type TimetableLocationRequest, TimetableLocationType } from "@/types"
import { computed, type ComputedRef, reactive, type Ref, ref, watch } from "vue"
import { useMessageStore } from "@/plugins/pinia/message-store"
import { HttpClientError, useHttpClient } from "@/plugins/api"
import ListDialogForm from "@/components/ListDialogForm.vue"

const api = useHttpClient()
const messageStore = useMessageStore()

interface Props {
    locationType: TimetableLocationType | null
    timetableLocation: TimetableLocation | null
    timetableDays: TimetableDay[]
}

const props = withDefaults(defineProps<Props>(), {
    locationType: null,
    timetableLocation: null,
    timetableDays: () => [],
})

const emit = defineEmits<{
    (e: "update:timetable-location", value: TimetableLocation): void
    (e: "timetable-location-created", value: TimetableLocation): void
    (e: "delete:timetable-location", value: TimetableLocation): void
}>()

const dialogOpen: Ref<boolean> = ref<boolean>(false)
const formValid: Ref<boolean> = ref<boolean>(false)
const loading: Ref<boolean> = ref(false)

const timetableLocationRequest = reactive<TimetableLocationRequest>({
    title: "",
    timetableLocationType: props.locationType ?? TimetableLocationType.ROOM,
    timetableDays: [],
})

const rules = {
    title: [(v: string) => !!v || "This field is required", (v: string) => v.length >= 3 || "Minimum 3 characters", (v: string) => v.length <= 50 || "Maximum 50 characters"],
}

const typeText: ComputedRef<string> = computed(() => {
    const locType = props.timetableLocation?.timetableLocationType ?? props.locationType

    switch (locType) {
        case TimetableLocationType.VOLUNTEER_POST:
            return "Volunteer Post"
        default:
            return "Room"
    }
})

const daysText: ComputedRef<string> = computed(() => {
    if (props.timetableDays.length === 0) {
        return "No Timetable Days available"
    }

    const days = props.timetableDays.filter((day) => {
        return props.timetableLocation?.timetableDays.some((timetableDay) => timetableDay.id === day.id)
    })

    return days.map((day: TimetableDay) => day.title).join(", ")
})

watch(
    dialogOpen,
    (dialogOpen: boolean): void => {
        if (dialogOpen) {
            populateRequest()
        }
    },
    { immediate: true }
)

function populateRequest(): void {
    if (props.timetableLocation) {
        timetableLocationRequest.title = props.timetableLocation.title
        timetableLocationRequest.timetableLocationType = props.timetableLocation.timetableLocationType
        timetableLocationRequest.timetableDays = props.timetableLocation.timetableDays.map((day: TimetableDay) => day.id)
    } else {
        timetableLocationRequest.title = ""
        timetableLocationRequest.timetableLocationType = props.locationType ?? TimetableLocationType.ROOM
        timetableLocationRequest.timetableDays = props.timetableDays.map((day: TimetableDay) => day.id)
    }
}

async function submitForm(): Promise<void> {
    if (formValid.value) {
        loading.value = true
        try {
            if (props.timetableLocation === null) {
                // Create new timetable location
                const newLocation: TimetableLocation = await api.timetableLocationService.createTimetableLocation(timetableLocationRequest)

                messageStore.addMessage({
                    text: "Timetable location created successfully.",
                    color: "success",
                    timeout: 3000,
                })

                emit("timetable-location-created", newLocation)
            } else {
                // Update existing timetable location
                const updatedLocation: TimetableLocation = await api.timetableLocationService.updateTimetableLocation(props.timetableLocation.id, timetableLocationRequest)

                messageStore.addMessage({
                    text: "Timetable location updated successfully.",
                    color: "success",
                    timeout: 3000,
                })

                emit("update:timetable-location", updatedLocation)
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
}

function deleteLocation(): void {
    if (props.timetableLocation) {
        emit("delete:timetable-location", props.timetableLocation)
    }
}
</script>

<style scoped></style>
