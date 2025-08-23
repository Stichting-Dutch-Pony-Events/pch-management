<template>
    <v-dialog v-model="isDialogOpen" max-width="80%">
        <template v-slot:activator="{ props: activatorProps }">
            <v-text-field
                v-bind="activatorProps"
                :model-value="attendeeName"
                prepend-icon="mdi-account"
                label="Assigned Attendee"
                readonly
            >
                <template v-slot:append-inner>
                    <v-btn
                        variant="text"
                        density="compact"
                        icon="mdi-close-circle"
                        :ripple="false"
                        @click.stop="emit('update:modelValue', null)"
                    ></v-btn>
                </template>
            </v-text-field>
        </template>

        <template v-slot:default="{ isActive }">
            <v-card :loading="loading">
                <v-card-item>
                    <v-card-title>Select Attendee</v-card-title>
                </v-card-item>

                <v-card-text>
                    <attendee-table
                        v-if="isActive"
                        :attendee-search-request="attendeeStore.attendeeSelectSearchRequest"
                        :initial-selected-roles="[
                            RoleEnum.VOLUNTEER,
                            RoleEnum.INFOBOOTH,
                            RoleEnum.STAFF,
                            RoleEnum.SUPER_ADMIN,
                        ]"
                        @select-attendee="onSelectAttendee"
                    ></attendee-table>
                </v-card-text>

                <template v-slot:actions>
                    <v-btn @click="isActive.value = false">Close</v-btn>
                </template>
            </v-card>
        </template>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, type Ref, watch } from "vue"
import { type Attendee, RoleEnum } from "@/types"
import { useHttpClient } from "@/plugins/api"
import AttendeeTable from "@/pages/admin/attendee/components/AttendeeTable.vue"
import { useAttendeeStore } from "@/plugins/pinia/attendee-store"

const api = useHttpClient()
const attendeeStore = useAttendeeStore()

interface Props {
    modelValue: string | null
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: null,
})

const emit = defineEmits<{
    (e: "update:modelValue", value: string | null): void
}>()

const loading: Ref<boolean> = ref(false)
const attendee: Ref<Attendee | null> = ref<Attendee | null>(null)
const isDialogOpen: Ref<boolean> = ref(false)

const attendeeName = computed(() => {
    if (loading.value) {
        return "Loading..."
    }
    return attendee.value ? `${attendee.value.nickName} (${attendee.value.name})` : "No Attendee Selected"
})

watch(
    () => props.modelValue,
    (newValue) => {
        if (newValue !== null && newValue !== attendee.value?.id) {
            void fetchAttendee()
        }
        if (newValue === null) {
            attendee.value = null
        }
    },
    { immediate: true }
)

async function fetchAttendee() {
    if (props.modelValue === null) {
        return
    }

    loading.value = true
    try {
        attendee.value = await api.attendeeService.getByIdentifier(props.modelValue)
    } catch (error) {
        console.error("Failed to fetch attendee:", error)
        attendee.value = null
    } finally {
        loading.value = false
    }
}

function onSelectAttendee(selectedAttendee: Attendee) {
    attendee.value = selectedAttendee
    emit("update:modelValue", selectedAttendee.id)
    isDialogOpen.value = false
}
</script>

<style scoped></style>
