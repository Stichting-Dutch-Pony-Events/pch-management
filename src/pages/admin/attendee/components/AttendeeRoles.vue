<template>
    <v-form class="fill-height">
        <v-card class="fill-height">
            <v-card-item>
                <v-card-title>Roles</v-card-title>
                <v-card-subtitle>Assign roles to Attendee</v-card-subtitle>
            </v-card-item>
            <v-card-text>
                <v-checkbox
                    v-model="setAttendeeRolesRequest.roles"
                    v-for="role in availableRoles"
                    :key="role.value"
                    :value="role.value"
                    :label="role.label"
                    hide-details
                    :disabled="loading"
                    @change="updateRoles"
                ></v-checkbox>
            </v-card-text>
        </v-card>
    </v-form>
</template>

<script setup lang="ts">
import { type Attendee, RoleEnum, type SetAttendeeRolesRequest } from "@/types"
import { reactive, ref, type Ref, watch } from "vue"
import { HttpClientError, useHttpClient } from "@/plugins/api"
import { useMessageStore } from "@/plugins/pinia/message-store"

const api = useHttpClient()
const messageStore = useMessageStore()

interface Props {
    attendee: Attendee | null
    modelValue: RoleEnum[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: "update:modelValue", value: RoleEnum[]): void
}>()

const loading: Ref<boolean> = ref<boolean>(false)
const setAttendeeRolesRequest: SetAttendeeRolesRequest = reactive({
    roles: [],
})

const availableRoles: Role[] = [
    { value: RoleEnum.USER, label: "Attendee" },
    { value: RoleEnum.VOLUNTEER, label: "Volunteer" },
    { value: RoleEnum.INFOBOOTH, label: "Info Booth Volunteer" },
    { value: RoleEnum.STAFF, label: "Con Staff" },
    { value: RoleEnum.SUPER_ADMIN, label: "Super Admin (Basically, Leah)" },
]

watch(
    () => props.modelValue,
    (): void => {
        populateSetAttendeeRolesRequest()
    },
    { immediate: true }
)

function populateSetAttendeeRolesRequest(): void {
    if (props.modelValue === null) {
        return
    }

    setAttendeeRolesRequest.roles = props.modelValue
}

async function updateRoles(): Promise<void> {
    if (props.attendee === null) {
        return
    }

    if (setAttendeeRolesRequest.roles.length === 0) {
        setAttendeeRolesRequest.roles.push(RoleEnum.USER)
    }

    loading.value = true
    try {
        const updatedAttendee = await api.attendeeService.setAttendeeRoles(props.attendee.id, setAttendeeRolesRequest)
        emit("update:modelValue", updatedAttendee.userRoles)

        messageStore.addMessage({
            text: "Roles updated successfully.",
            color: "success",
            timeout: 3000,
        })
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

interface Role {
    value: RoleEnum
    label: string
}
</script>

<style scoped></style>
