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
    </div>
</template>

<script setup lang="ts">
import { HttpClientError, useHttpClient } from "@/plugins/api"
import { useMessageStore } from "@/plugins/pinia/message-store"
import { useRoute } from "vue-router"
import { computed, type ComputedRef, ref, type Ref } from "vue"
import type { Attendee } from "@/types"

const api = useHttpClient()
const messageStore = useMessageStore()
const route = useRoute()

const loading: Ref<boolean> = ref(false)

const attendeeId: ComputedRef<string | null> = computed(() => {
    const attendeeId = route.params.attendeeId as string
    return attendeeId ?? null
})

const attendee: Ref<Attendee | null> = ref<Attendee | null>(null)

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
            messageStore.addMessage({ text: "An unexpected error occurred while trying to fetch the attendee.", color: "error", timeout: 5000 })
        }
    } finally {
        loading.value = false
    }
}
</script>

<style scoped></style>
