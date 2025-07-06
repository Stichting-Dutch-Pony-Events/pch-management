<script setup lang="ts"></script>

<template>
    <v-layout class="fill-height">
        <v-app-bar title="PonyCon Holland App - Management Console"></v-app-bar>

        <v-navigation-drawer>
            <v-list nav>
                <v-list-item title="Teams" prepend-icon="mdi-account-group" :to="{ name: 'TeamsOverview' }"></v-list-item>
                <v-list-item title="Character Quiz" prepend-icon="mdi-chat-question" :to="{ name: 'QuizOverview' }"></v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-main class="d-flex align-center justify-center fill-height" height="300">
            <v-container fluid class="fill-height flex-grow-1">
                <router-view></router-view>
            </v-container>
        </v-main>
    </v-layout>
</template>

<style scoped></style>
