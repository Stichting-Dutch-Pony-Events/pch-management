<template>
    <div class="d-flex flex-column fill-height w-100">
        <v-toolbar class="mb-4">
            <v-toolbar-title style="max-width: 300px; flex: inherit">
                <v-icon>mdi-horse</v-icon>
                Attendees
            </v-toolbar-title>
        </v-toolbar>

        <attendee-table
            @select-attendee="selectAttendee"
            :initial-selected-roles="null"
            :attendee-search-request="attendeeStore.attendeeSearchRequest"
        ></attendee-table>
    </div>
</template>

<script setup lang="ts">
import AttendeeTable from "@/pages/admin/attendee/components/AttendeeTable.vue"
import { useRouter } from "vue-router"
import type { Attendee } from "@/types"
import { useAttendeeStore } from "@/plugins/pinia/attendee-store"

const router = useRouter()
const attendeeStore = useAttendeeStore()

function selectAttendee(item: Attendee): void {
    void router.push({
        name: "attendee-details",
        params: { attendeeId: item.id },
    })
}
</script>

<style scoped></style>
