<template>
    <v-sheet class="d-flex flex-column fill-height w-100">
        <v-toolbar>
            <v-toolbar-title>Character Quiz Questions</v-toolbar-title>
            <template v-slot:append>
                <v-btn icon="mdi-plus" @click="createQuestion" />
            </template>
        </v-toolbar>
        <v-progress-linear indeterminate v-if="loading"></v-progress-linear>

        <v-row class="flex-grow-1 fill-height">
            <v-col class="v-col-lg-3 v-col-xl-2 fill-height" style="overflow-y: auto">
                <v-list>
                    <!--
                    <v-list-item v-for="team in teams" :key="team.id" :to="{ name: 'TeamDetails', params: { teamId: team.id } }">
                        {{ team.name }}
                    </v-list-item>
                    -->
                </v-list>
            </v-col>

            <v-col class="fill-height" style="overflow-y: auto">
                <router-view v-model:loading="loading" />
            </v-col>
        </v-row>
    </v-sheet>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router"
import { ref, type Ref } from "vue"

const router = useRouter()

const loading: Ref<boolean> = ref(false)

function createQuestion(): void {
    void router.push({ name: "QuizForm", params: { quizId: "create" } })
}
</script>

<style scoped></style>
