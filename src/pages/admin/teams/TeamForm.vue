<template>
    <v-card class="fill-height w-100">
        <v-form v-model="formValid" @submit.prevent="saveTeam">
            <v-card-item>
                <v-card-title v-if="props.team === null">Create Team</v-card-title>
                <v-card-title v-else>Edit Team {{ props.team.name }}</v-card-title>
            </v-card-item>

            <v-card-text>
                <v-text-field v-model="teamRequest.name" label="Team Name" :rules="rules.name"></v-text-field>
                <v-textarea v-model="teamRequest.description" label="Description" :rules="rules.description"></v-textarea>
                <v-text-field
                    v-model="teamRequest.identifier"
                    label="Identifier"
                    hint="Must be unique and contain only lowercase letters, numbers, and dashes"
                    persistent-hint
                    :rules="rules.identifier"
                ></v-text-field>
            </v-card-text>

            <v-card-actions>
                <v-btn variant="plain" :to="{ name: 'TeamsOverview' }">Cancel</v-btn>
                <v-spacer></v-spacer>
                <v-btn variant="plain" type="submit" :disabled="props.loading">Save</v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script setup lang="ts">
import type { Team, TeamRequest } from "@/types"
import { reactive, ref, type Ref, watch } from "vue"
import { HttpClient, useHttpClient } from "@/plugins/api"
import { useMessageStore } from "@/plugins/pinia/message-store"
import router from "@/router"

const api: HttpClient = useHttpClient()
const messageStore = useMessageStore()

interface Props {
    team: Team | null
    loading: boolean
}

const props = withDefaults(defineProps<Props>(), {
    team: null,
    loading: false,
})

const emit = defineEmits<{
    (e: "update:loading", value: boolean): void
    (e: "team-saved", team: Team): void
}>()

const teamRequest: TeamRequest = reactive<TeamRequest>({
    name: "",
    description: "",
    identifier: "",
})

const formValid: Ref<boolean> = ref(false)
const rules = {
    name: [(v: string) => !!v || "This field is required", (v: string) => v.length >= 3 || "Minimum 3 characters", (v: string) => v.length <= 155 || "Maximum 155 characters"],
    description: [(v: string) => v.length <= 1000 || "Maximum 1000 characters"],
    identifier: [
        (v: string) => !!v || "This field is required",
        (v: string) => /^[A-Z0-9-]+$/.test(v) || "Must contain only uppercase letters, numbers, and dashes",
        (v: string) => v.length >= 3 || "Minimum 3 characters",
        (v: string) => v.length <= 50 || "Maximum 50 characters",
    ],
}

watch(
    () => props.team,
    (): void => {
        populateRequest()
    }
)

function populateRequest(): void {
    if (props.team !== null) {
        teamRequest.name = props.team.name
        teamRequest.description = props.team.description
        teamRequest.identifier = props.team.identifier
    } else {
        teamRequest.name = ""
        teamRequest.description = ""
        teamRequest.identifier = ""
    }
}

function setLoading(loading: boolean): void {
    emit("update:loading", loading)
}

async function saveTeam(): Promise<void> {
    if (formValid.value) {
        try {
            setLoading(true)

            if (props.team === null) {
                const newTeam = await api.teamService.createTeam(teamRequest)
                emit("team-saved", newTeam)
                messageStore.addMessage({
                    color: "success",
                    text: `Team ${newTeam.name} created successfully!`,
                    timeout: 3000,
                })

                void router.push({ name: "TeamDetails", params: { teamId: newTeam.id } })
            } else {
                const updatedTeam = await api.teamService.updateTeam(props.team.id, teamRequest)
                emit("team-saved", updatedTeam)
                messageStore.addMessage({
                    color: "success",
                    text: `Team ${updatedTeam.name} updated successfully!`,
                    timeout: 3000,
                })
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }
}
</script>

<style scoped></style>
