<template>
    <v-dialog v-model="dialogOpen" max-width="600px">
        <template #activator="{ props: activatorProps }">
            <slot name="activator" v-bind="{ props: activatorProps }">
                <!-- fallback if parent doesn't provide activator -->
                <div
                    v-if="timetableItem !== null"
                    v-bind="activatorProps"
                    class="event-block d-flex flex-column justify-space-between"
                    :style="{
                        top: `${props.topOffset}px`,
                        height: `${props.height}px`,
                        'background-color': timetableItem.colour ?? '#1976d2',
                    }"
                >
                    <span class="text-subtitle-1 font-weight-bold">{{ timetableItem.title }}</span>
                    <span class="flex-grow-1 truncate-text text-body-2 font-weight-light">{{
                        timetableItem.description
                    }}</span>
                    <div class="d-flex flex-row justify-lg-space-between">
                        <span class="text-caption font-weight-medium">
                            {{ startTime.toLocaleString(DateTime.TIME_24_SIMPLE) }} -
                            {{ endTime.toLocaleString(DateTime.TIME_24_SIMPLE) }}
                        </span>
                        <span class="text-caption font-weight-medium" v-if="timetableItem.volunteer">
                            {{ timetableItem.volunteer?.nickName }} ({{ timetableItem.volunteer?.name }})
                        </span>
                    </div>
                </div>
            </slot>
        </template>

        <template v-slot:default="{ isActive }">
            <v-form ref="formRef" v-model="formValid" @submit.prevent="submitForm">
                <v-card :loading="loading">
                    <v-card-item>
                        <div class="d-flex flex-row justify-space-between">
                            <v-card-title v-if="props.timetableItem === null">Create Timetable Item</v-card-title>
                            <v-card-title v-else>Edit Timetable Item</v-card-title>
                            <confirm-dialog
                                v-if="props.timetableItem !== null"
                                :message="`You will be deleting the timetable item: ${props.timetableItem.title}`"
                                @confirm="deleteTimetableItem"
                            />
                        </div>
                    </v-card-item>

                    <v-card-text>
                        <span class="d-block"><b>Day: </b> {{ timetableDay?.title ?? "Not set" }}</span>
                        <span class="d-block mb-4"><b>Location: </b> {{ timetableLocation?.title ?? "Not set" }}</span>
                        <v-text-field
                            v-model="timetableItemRequest.title"
                            label="Title"
                            counter="50"
                            :rules="rules.title"
                        ></v-text-field>
                        <v-textarea
                            v-model="timetableItemRequest.description"
                            label="Description"
                            counter="1000"
                            :rules="rules.description"
                        ></v-textarea>
                        <v-row no-gutters>
                            <v-col class="mr-2">
                                <date-picker
                                    v-model="timetableItemRequest.startTime"
                                    :text-field-props="{
                                        prependIcon: 'mdi-calendar-start',
                                        label: 'Start Date',
                                        rules: rules.startTime,
                                    }"
                                ></date-picker>
                            </v-col>
                            <v-col class="ml-2">
                                <time-picker
                                    v-model="timetableItemRequest.startTime"
                                    :text-field-props="{ prependIcon: 'mdi-clock-start', label: 'Start Time' }"
                                ></time-picker>
                            </v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col class="mr-2">
                                <date-picker
                                    v-model="timetableItemRequest.endTime"
                                    :text-field-props="{
                                        prependIcon: 'mdi-calendar-end',
                                        label: 'End Date',
                                        rules: rules.endTime,
                                    }"
                                ></date-picker>
                            </v-col>
                            <v-col class="ml-2">
                                <time-picker
                                    v-model="timetableItemRequest.endTime"
                                    :text-field-props="{ prependIcon: 'mdi-clock-end', label: 'End Time' }"
                                ></time-picker>
                            </v-col>
                        </v-row>
                        <colour-picker v-model="timetableItemRequest.colour" class="mt-4"></colour-picker>
                        <attendee-select
                            v-if="allowAttendeeAttachment"
                            v-model="timetableItemRequest.volunteerId"
                        ></attendee-select>
                    </v-card-text>

                    <template v-slot:actions>
                        <v-btn @click="isActive.value = false">Cancel</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn type="submit" :disabled="loading">Save</v-btn>
                    </template>
                </v-card>
            </v-form>
        </template>
    </v-dialog>
</template>
<script setup lang="ts">
import { computed, reactive, type Ref, ref, useTemplateRef, watch } from "vue"
import type { TimetableDay, TimetableItem, TimetableItemRequest, TimetableLocation } from "@/types"
import type { VForm } from "vuetify/components"
import { DateTime } from "luxon"
import DatePicker from "@/components/DatePicker.vue"
import TimePicker from "@/components/TimePicker.vue"
import { HttpClientError, useHttpClient } from "@/plugins/api"
import { useMessageStore } from "@/plugins/pinia/message-store"
import ConfirmDialog from "@/components/ConfirmDialog.vue"
import AttendeeSelect from "@/pages/admin/attendee/components/AttendeeSelect.vue"
import ColourPicker from "@/components/ColourPicker.vue"

const api = useHttpClient()
const messageStore = useMessageStore()

interface Props {
    timetableItem: TimetableItem | null
    timetableLocation: TimetableLocation
    timetableDay: TimetableDay
    topOffset?: number
    height?: number
    allowAttendeeAttachment: boolean
}

const props = withDefaults(defineProps<Props>(), {
    timetableItem: null,
    topOffset: 0,
    height: 0,
    allowAttendeeAttachment: false,
})

const emit = defineEmits<{
    (e: "timetable-item-created", value: TimetableItem): void
    (e: "update:timetable-item", value: TimetableItem): void
    (e: "delete:timetable-item", value: TimetableItem): void
}>()

const formRef: Ref<VForm | null> = useTemplateRef<VForm>("formRef")
const dialogOpen: Ref<boolean> = ref(false)
const formValid: Ref<boolean> = ref(false)
const loading: Ref<boolean> = ref(false)

const rules = {
    title: [
        (v: string) => !!v || "This field is required",
        (v: string) => v.length >= 3 || "Minimum 3 characters",
        (v: string) => v.length <= 50 || "Maximum 50 characters",
    ],
    description: [(v: string) => v.length <= 1000 || "Maximum 1000 characters"],
    startTime: [
        (v: string) => !!v || "This field is required",
        () => startTime.value < endTime.value || "Start time must be before end time",
    ],
    endTime: [
        (v: string) => !!v || "This field is required",
        () => endTime.value > startTime.value || "End time must be after start time",
    ],
}

const startTime = computed<DateTime>(
    (): DateTime => DateTime.fromISO(timetableItemRequest.startTime).setZone("Europe/Amsterdam")
)
const endTime = computed<DateTime>(
    (): DateTime => DateTime.fromISO(timetableItemRequest.endTime).setZone("Europe/Amsterdam")
)

const timetableItemRequest: TimetableItemRequest = reactive({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    colour: "#ff9e5a",
    timetableLocationId: props.timetableLocation.id,
    timetableDayId: props.timetableDay.id,
    volunteerId: null,
})

watch(
    dialogOpen,
    () => {
        populateForm()
    },
    { immediate: true }
)

function populateForm() {
    if (props.timetableItem) {
        timetableItemRequest.title = props.timetableItem.title
        timetableItemRequest.description = props.timetableItem.description
        timetableItemRequest.startTime = props.timetableItem.startTime
        timetableItemRequest.endTime = props.timetableItem.endTime
        timetableItemRequest.timetableLocationId = props.timetableLocation.id
        timetableItemRequest.timetableDayId = props.timetableDay.id
        timetableItemRequest.colour = props.timetableItem.colour
        timetableItemRequest.volunteerId = props.timetableItem.volunteer?.id ?? null
    } else {
        const endTime: string = DateTime.fromISO(props.timetableDay.startsAt).plus({ minutes: 90 }).toISO() ?? ""

        timetableItemRequest.title = ""
        timetableItemRequest.description = ""
        timetableItemRequest.startTime = props.timetableDay.startsAt
        timetableItemRequest.endTime = endTime
        timetableItemRequest.timetableDayId = props.timetableDay.id
        timetableItemRequest.timetableLocationId = props.timetableLocation?.id
        timetableItemRequest.colour = "#ff9e5a"
        timetableItemRequest.volunteerId = null
    }
}

function deleteTimetableItem() {
    if (props.timetableItem) {
        emit("delete:timetable-item", props.timetableItem)
        dialogOpen.value = false
    }
}

async function submitForm() {
    if (!formRef.value || !(await formRef.value.validate())) {
        return
    }

    loading.value = true
    try {
        if (props.timetableItem === null) {
            const timetableItem: TimetableItem =
                await api.timetableItemService.createTimetableItem(timetableItemRequest)

            messageStore.addMessage({
                text: "Timetable item created successfully",
                color: "success",
                timeout: 5000,
            })

            emit("timetable-item-created", timetableItem)
        } else {
            const updatedTimetableItem: TimetableItem = await api.timetableItemService.updateTimetableItem(
                props.timetableItem.id,
                timetableItemRequest
            )

            messageStore.addMessage({
                text: "Timetable item updated successfully",
                color: "success",
                timeout: 5000,
            })

            emit("update:timetable-item", updatedTimetableItem)
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
</script>

<style scoped>
.event-block {
    position: absolute;
    left: 10px;
    right: 10px;
    background-color: #1976d2;
    color: white;
    padding: 0.5rem;
    border-radius: 6px;
    font-size: 0.85rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    z-index: 1; /* 👈 sit above background lines */
}

.truncate-text {
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
}
</style>
