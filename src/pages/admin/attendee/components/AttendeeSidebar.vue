<template>
    <v-form class="fill-height">
        <v-card class="fill-height">
            <v-card-text>
                <img
                    :src="badgeImageUrl"
                    style="width: 100%; border-radius: 10px"
                    class="elevation-4"
                    alt="User Badge"
                />
            </v-card-text>
        </v-card>
    </v-form>
</template>

<script setup lang="ts">
import { type Attendee } from "@/types"
import { HttpClientError, useHttpClient } from "@/plugins/api"
import { useMessageStore } from "@/plugins/pinia/message-store"
import { ref, type Ref, watch } from "vue"

const api = useHttpClient()
const messageStore = useMessageStore()

interface Props {
    attendee: Attendee | null
}

const props = defineProps<Props>()

const badgeImageUrl: Ref<string | undefined> = ref(undefined)

watch(
    () => props.attendee,
    (newAttendee) => {
        if (newAttendee !== null) {
            void downloadBadgeImage()
        } else {
            badgeImageUrl.value = undefined
        }
    },
    { immediate: true }
)

async function downloadBadgeImage(): Promise<void> {
    if (props.attendee === null) {
        return
    }

    try {
        const response = await api.attendeeService.getAttendeeBadge(props.attendee.id, true)
        badgeImageUrl.value = URL.createObjectURL(response)
    } catch (error) {
        if (error instanceof HttpClientError) {
            messageStore.addMessage({
                text: error.message,
                color: "error",
                timeout: 5000,
            })
        } else {
            console.error("Failed to download Attendee Badge", error)
        }
    }
}
</script>

<style scoped></style>
