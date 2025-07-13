<template>
    <v-row class="flex-grow-1 fill-height">
        <v-col>
            <v-card class="fill-height">
                <v-card-item>
                    <v-card-title>Rooms</v-card-title>
                </v-card-item>
            </v-card>
        </v-col>
        <v-col>
            <v-card class="fill-height">
                <v-card-item>
                    <v-card-title>Posts</v-card-title>
                </v-card-item>
            </v-card>
        </v-col>
        <v-col>
            <days-overview />
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import DaysOverview from "@/pages/admin/timetable/components/DaysOverview.vue"
</script>

<style scoped></style>
