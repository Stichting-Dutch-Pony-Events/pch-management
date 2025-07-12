<template>
    <v-card class="fill-height w-100" :loading="loading">
        <v-form ref="answerForm" v-model="formValid" @submit.prevent="submit">
            <v-card-item>
                <v-card-title v-if="props.quizAnswer === null">Create Answer</v-card-title>
                <v-card-title v-else>Edit Answer</v-card-title>
            </v-card-item>

            <v-card-text>
                <v-text-field v-model="quizAnswerRequest.title" :rules="rules.title" label="Title" counter="50" hint="Won't be shown in app, just for our reference"></v-text-field>
                <v-textarea v-model="quizAnswerRequest.answer" :rules="rules.answer" label="Answer" counter="500" auto-grow></v-textarea>
                <v-divider class="mb-2"></v-divider>
                <span class="text-subtitle-1">Team Weights</span>
                <div v-for="(weight, index) in quizAnswerRequest.teamWeights" :key="`teamWeight-${index}`" class="d-flex justify-space-between align-center" style="width: 100%">
                    <div style="width: 600px" class="d-flex justify-left align-center">
                        <v-btn icon="mdi-minus" color="error" variant="text" class="mb-4 mr-4" @click="quizAnswerRequest.teamWeights.splice(index, 1)"></v-btn>
                        <v-select
                            v-model="weight.teamId"
                            label="Team"
                            item-title="name"
                            item-value="id"
                            :return-object="false"
                            :items="getTeamList(weight.teamId)"
                            :rules="rules.team"
                            max-width="500px"
                        ></v-select>
                    </div>
                    <v-number-input v-model="weight.weight" control-variant="split" max-width="200px" label="Weight" :rules="rules.weight"></v-number-input>
                </div>
                <div class="d-flex justify-space-between align-center" style="width: 100%">
                    <!-- Left-aligned + button -->
                    <v-btn @click="addTeamWeight" color="primary" prepend-icon="mdi-plus" text="Add Team Weight" :disabled="teamsAvailable.length < 1"></v-btn>

                    <!-- Right-aligned text field -->
                    <div class="d-flex flex-column align-end">
                        <v-divider thickness="2" style="width: 200px" class="mb-2"></v-divider>
                        <v-text-field label="Total Team Weight" :model-value="totalTeamWeight" suffix="/ 100" readonly style="width: 200px" :rules="rules.totalTeamWeight" />
                    </div>
                </div>
            </v-card-text>

            <v-card-actions>
                <v-btn variant="text" :to="{ name: 'TeamsOverview' }">Cancel</v-btn>
                <v-spacer></v-spacer>
                <v-btn variant="text" type="submit" :disabled="loading">Save</v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script setup lang="ts">
import type { VForm } from "vuetify/components"
import type { QuizAnswer, QuizAnswerRequest, QuizQuestion, Team } from "@/types"
import { computed, type ComputedRef, nextTick, reactive, ref, type Ref, watch } from "vue"
import { HttpClientError, useHttpClient } from "@/plugins/api"
import { useMessageStore } from "@/plugins/pinia/message-store"
import { useRouter } from "vue-router"

interface Props {
    quizQuestion: QuizQuestion
    quizAnswer: QuizAnswer | null
}

const props = withDefaults(defineProps<Props>(), {
    quizAnswer: null,
})

const emit = defineEmits<{
    (e: "update:quizAnswer", value: QuizAnswer): void
    (e: "answer-created", value: QuizAnswer): void
}>()

const api = useHttpClient()
const messageStore = useMessageStore()
const router = useRouter()

const answerForm = ref<VForm | null>(null)
const loading: Ref<boolean> = ref(false)
const formValid: Ref<boolean> = ref(false)
const rules = {
    title: [(v: string) => !!v || "This field is required", (v: string) => v.length >= 3 || "Minimum 3 characters", (v: string) => v.length <= 50 || "Maximum 50 characters"],
    answer: [(v: string) => !!v || "This field is required", (v: string) => v.length >= 3 || "Minimum 3 characters", (v: string) => v.length <= 500 || "Maximum 500 characters"],
    totalTeamWeight: [() => totalTeamWeight.value === 100 || "Total team weight must equal 100"],
    team: [(v: string) => !!v || "This field is required", () => noDuplicateTeamWeights.value || "No duplicate teams allowed"],
    weight: [(v: number) => v > 0 || "Weight must be greater than 0", (v: number) => v <= 100 || "Weight must be less than or equal to 100"],
}

const teams: Ref<Team[]> = ref<Team[]>([])
const quizAnswerRequest: QuizAnswerRequest = reactive<QuizAnswerRequest>({
    title: "",
    answer: "",
    teamWeights: [],
})

const totalTeamWeight: ComputedRef<number> = computed(() => {
    return quizAnswerRequest.teamWeights.reduce((total, teamWeight) => total + teamWeight.weight, 0)
})

const teamsAvailable: ComputedRef<Team[]> = computed(() => {
    const teamIds = quizAnswerRequest.teamWeights.map((teamWeight) => teamWeight.teamId)
    return teams.value.filter((team: Team) => !teamIds.includes(team.id))
})

const noDuplicateTeamWeights: ComputedRef<boolean> = computed(() => {
    const teamIds = quizAnswerRequest.teamWeights.map((teamWeight) => teamWeight.teamId)
    return new Set(teamIds).size === teamIds.length
})

watch(
    () => props.quizAnswer,
    (quizAnswer: QuizAnswer | null) => {
        populateAnswerRequest(quizAnswer)

        void nextTick(() => {
            answerForm.value?.resetValidation()
        })
    },
    { immediate: true }
)

void getTeams()
async function getTeams(): Promise<void> {
    loading.value = true
    try {
        // Assuming you have a method to fetch teams, replace with actual API call
        teams.value = await api.teamService.listTeams()
    } catch (error) {
        console.error("Failed to load teams:", error)
    } finally {
        loading.value = false
    }
}

function populateAnswerRequest(quizAnswer: QuizAnswer | null): void {
    quizAnswerRequest.title = quizAnswer?.title ?? ""
    quizAnswerRequest.answer = quizAnswer?.answer ?? ""
    quizAnswerRequest.teamWeights = []

    for (const teamWeight of quizAnswer?.quizAnswerTeamWeights ?? []) {
        quizAnswerRequest.teamWeights.push({
            id: teamWeight.id,
            teamId: teamWeight.team.id,
            weight: teamWeight.weight,
        })
    }
}

function addTeamWeight(): void {
    if (teamsAvailable.value.length > 0) {
        const team = teamsAvailable.value[0] // Get the first available team
        quizAnswerRequest.teamWeights.push({
            id: "",
            teamId: team.id,
            weight: 0, // Default weight
        })
    }
}

function getTeamList(selectedTeamId: string | null): Team[] {
    const selectedTeam = teams.value.find((team) => team.id === selectedTeamId)
    const available = teamsAvailable.value
    return selectedTeam ? [selectedTeam, ...available] : available
}

async function submit(): Promise<void> {
    if (formValid.value) {
        loading.value = true
        try {
            if (props.quizAnswer === null) {
                // Create new answer
                const newAnswer = await api.quizService.createQuizAnswer(props.quizQuestion.id, quizAnswerRequest)

                messageStore.addMessage({
                    color: "success",
                    text: "Question created successfully.",
                    timeout: 3000,
                })

                emit("answer-created", newAnswer)
                void router.push({ name: "QuizOverview", params: { quizQuestionId: props.quizQuestion.id, quizAnswerId: newAnswer.id } })
            } else {
                const updatedAnswer = await api.quizService.updateQuizAnswer(props.quizQuestion.id, props.quizAnswer.id, quizAnswerRequest)

                messageStore.addMessage({
                    color: "success",
                    text: "Question updated successfully.",
                    timeout: 3000,
                })

                emit("update:quizAnswer", updatedAnswer)
            }
        } catch (error: unknown) {
            if (error instanceof HttpClientError) {
                messageStore.addMessage({
                    color: "error",
                    text: error.message,
                    timeout: 5000,
                })
            }
        } finally {
            loading.value = false
        }
    }
}
</script>

<style scoped></style>
