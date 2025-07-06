<template>
    <v-sheet class="d-flex flex-column fill-height w-100">
        <v-toolbar>
            <v-toolbar-title>Teams</v-toolbar-title>
            <template v-slot:append>
                <v-btn icon="mdi-plus" @click="createTeam" />
            </template>
        </v-toolbar>
        <v-progress-linear indeterminate v-if="loading"></v-progress-linear>

        <v-row class="flex-grow-1 fill-height">
            <v-col class="v-col-lg-3 v-col-xl-2 fill-height" style="overflow-y: auto">
                <v-list>
                    <v-list-item v-for="team in teams" :key="team.id" :to="{ name: 'TeamDetails', params: { teamId: team.id } }">
                        {{ team.name }}
                    </v-list-item>
                </v-list>
            </v-col>

            <v-col class="fill-height" style="overflow-y: auto">
                <router-view v-model:loading="loading" :team="selectedTeam" @team-saved="getTeams" />
            </v-col>
        </v-row>
    </v-sheet>
</template>

<script setup lang="ts">
import { HttpClient, useHttpClient } from "@/plugins/api"
import type { Team } from "@/types"
import { useRouter } from "vue-router"
import { computed, type ComputedRef, ref, type Ref } from "vue"

const router = useRouter()

const api: HttpClient = useHttpClient()
const loading: Ref<boolean> = ref(false)
const teams: Ref<Team[]> = ref<Team[]>([])

const selectedTeam: ComputedRef<Team | null> = computed(() => {
    const teamId: string | string[] | null = router.currentRoute.value.params.teamId ?? null

    return teams.value.find((team: Team) => team.id === teamId) ?? null
})

void getTeams()

async function getTeams(): Promise<void> {
    loading.value = true
    try {
        teams.value = await api.teamService.listTeams()
    } catch (error) {
        console.log(error)
    } finally {
        loading.value = false
    }
}

function createTeam(): void {
    void router.push({ name: "TeamDetails", params: { teamId: "create" } })
}
</script>

<style scoped></style>
