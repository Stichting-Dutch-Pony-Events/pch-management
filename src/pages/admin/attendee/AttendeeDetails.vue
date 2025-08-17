<template>
    <div class="d-flex flex-column fill-height w-100">
        <v-toolbar class="mb-4">
            <v-btn icon="mdi-chevron-left" variant="text" :to="{ name: 'attendee-overview' }"></v-btn>

            <v-toolbar-title>
                <v-icon>mdi-horse</v-icon>
                <span v-if="!attendee" class="ml-2">Loading Attendee...</span>
                <span v-else class="ml-2">{{ attendee.nickName }} ({{ attendee.name }})</span>
            </v-toolbar-title>
        </v-toolbar>

        <v-row>
            <v-col cols="12" sm="12" md="12" lg="6">
                <attendee-form v-model:attendee="attendee" :loading="loading"></attendee-form>
            </v-col>
            <v-col cols="12" sm="12" md="6" lg="3">
                <attendee-roles v-model="roles" :attendee="attendee"></attendee-roles>
            </v-col>
            <v-col cols="12" sm="12" md="6" lg="3">
                <attendee-sidebar :attendee="attendee"></attendee-sidebar>
            </v-col>
        </v-row>
    </div>
</template>

<script setup lang="ts">
import { HttpClientError, useHttpClient } from "@/plugins/api"
import { useMessageStore } from "@/plugins/pinia/message-store"
import { useRoute } from "vue-router"
import { computed, type ComputedRef, ref, type Ref } from "vue"
import { type Attendee, RoleEnum } from "@/types"
import AttendeeForm from "@/pages/admin/attendee/components/AttendeeForm.vue"
import AttendeeRoles from "@/pages/admin/attendee/components/AttendeeRoles.vue"
import AttendeeSidebar from "@/pages/admin/attendee/components/AttendeeSidebar.vue"

const api = useHttpClient()
const messageStore = useMessageStore()
const route = useRoute()

const loading: Ref<boolean> = ref(false)

const attendeeId: ComputedRef<string | null> = computed(() => {
    const attendeeId = route.params.attendeeId as string
    return attendeeId ?? null
})

const attendee: Ref<Attendee | null> = ref<Attendee | null>(null)

const roles = computed<RoleEnum[]>({
    get: () => attendee.value?.userRoles ?? [],
    set: (value: RoleEnum[]) => {
        if (attendee.value) {
            attendee.value.userRoles = value
        }
    },
})

void retrieveAttendee()
async function retrieveAttendee(): Promise<void> {
    if (!attendeeId.value) {
        return
    }

    loading.value = true
    try {
        attendee.value = await api.attendeeService.getByIdentifier(attendeeId.value)
    } catch (e) {
        if (e instanceof HttpClientError) {
            messageStore.addMessage({
                color: "error",
                text: e.message,
                timeout: 5000,
            })
        } else {
            messageStore.addMessage({
                text: "An unexpected error occurred while trying to fetch the attendee.",
                color: "error",
                timeout: 5000,
            })
        }
    } finally {
        loading.value = false
    }
}
</script>

<style scoped></style>
