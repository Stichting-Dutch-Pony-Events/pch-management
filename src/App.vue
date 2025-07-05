<template>
    <v-app>
        <v-main>
            <router-view />
        </v-main>

        <v-snackbar-queue v-model="messageStore.queue"></v-snackbar-queue>
    </v-app>
</template>

<script lang="ts" setup>
import { useMessageStore } from "@/plugins/pinia/message-store"

const messageStore = useMessageStore()
</script>
