<template>
    <div class="d-flex flex-column fill-height w-100">
        <v-toolbar class="mb-4">
            <v-toolbar-title style="max-width: 300px; flex: inherit">
                <v-icon>mdi-timeline-clock</v-icon>
                Schedules
            </v-toolbar-title>

            <v-divider vertical class="ml-10"></v-divider>
            <v-tabs>
                <v-tab text="Public Schedule" prepend-icon="mdi-calendar-star" :to="{ name: 'publicTimetable' }"></v-tab>
                <v-divider vertical></v-divider>
                <v-tab text="Volunteer Schedules" prepend-icon="mdi-calendar-account" :to="{ name: 'volunteerTimetable' }"></v-tab>
                <v-divider vertical></v-divider>
                <v-tab text="Settings" prepend-icon="mdi-cog" :to="{ name: 'timetableSettings' }"></v-tab>
            </v-tabs>
            <v-divider vertical class="mr-10"></v-divider>
        </v-toolbar>
        <router-view></router-view>
    </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
