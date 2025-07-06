<template>
    <v-card class="fill-height w-100 d-flex flex-column">
        <v-form v-model="formValid" @submit.prevent="" class="d-flex flex-column fill-height">
            <v-card-item>
                <v-card-title v-if="quizQuestion === null">Create Question</v-card-title>
                <v-card-title v-else>Edit Question {{ quizQuestion.question }}</v-card-title>
            </v-card-item>

            <v-card-text class="flex-grow-1">
                <v-row>
                    <v-col cols="3">
                        <v-textarea v-model="quizRequest.question" label="Question" :rules="[(value) => !!value || 'Question is required']"></v-textarea>
                    </v-col>

                    <v-col cols="3">
                        <v-list>
                            <v-list-item @click="addAnswer">
                                <template v-slot:prepend>
                                    <v-icon>mdi-plus</v-icon>
                                </template>
                                <v-list-item-title>Add Answer</v-list-item-title>
                            </v-list-item>
                            <v-list-item v-for="(answer, index) in quizRequest.answers" :key="index" @click="selectedAnswer = answer" :class="{ 'v-list-item--active': selectedAnswer === answer }">
                                <v-list-item-title>{{ answer.answer }}</v-list-item-title>

                                <template v-slot:append>
                                    <v-btn icon @click.stop="quizRequest.answers.splice(index, 1)">
                                        <v-icon>mdi-delete</v-icon>
                                    </v-btn>
                                </template>
                            </v-list-item>
                        </v-list>
                    </v-col>
                    <v-col cols="6"> </v-col>
                </v-row>
            </v-card-text>

            <v-card-actions class="border-t">
                <v-btn variant="plain" :to="{ name: 'TeamsOverview' }" color="error">Cancel</v-btn>
                <v-spacer></v-spacer>
                <v-btn variant="plain" type="submit" :disabled="props.loading" color="success" prepend-icon="mdi-content-save">Save</v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script setup lang="ts">
import { reactive, ref, type Ref } from "vue"
import type { QuizAnswerRequest, QuizQuestion, QuizQuestionRequest } from "@/types"
import { useRoute } from "vue-router"
import { useHttpClient } from "@/plugins/api"
import { useMessageStore } from "@/plugins/pinia/message-store"

interface Props {
    loading: boolean
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
})

const emit = defineEmits<{
    (e: "update:loading", value: boolean): void
}>()

const route = useRoute()
const api = useHttpClient()
const messageStore = useMessageStore()

const formValid: Ref<boolean> = ref(false)
const quizQuestion: Ref<QuizQuestion | null> = ref(null)

const rules = {
    question: [(v: string) => !!v || "This field is required", (v: string) => v.length >= 3 || "Minimum 3 characters", (v: string) => v.length <= 500 || "Maximum 500 characters"],
}

const quizRequest: QuizQuestionRequest = reactive<QuizQuestionRequest>({
    question: "",
    answers: [],
})

const selectedAnswer: Ref<QuizAnswerRequest | null> = ref(null)

void fetchQuizQuestion()

async function fetchQuizQuestion() {
    if (route.params.quizId === "create") {
        quizQuestion.value = null
        return
    }

    if (route.params.quizId !== undefined) {
        try {
            setLoading(true)
            quizQuestion.value = await api.quizService.getQuestion(route.params.quizId as string)
        } catch (error: HttpClientError) {
            messageStore.addMessage({
                text: error.message,
                color: "error",
                timeout: 5000,
            })

            console.error("Failed to fetch quiz question:", error)
            quizQuestion.value = null
        } finally {
            setLoading(false)
        }
    }
}

function addAnswer() {
    const answer: QuizAnswerRequest = {
        id: null,
        answer: "New Answer",
        order: getNextAnswerOrder(),
        teamWeights: [],
    }

    quizRequest.answers.push(answer)

    selectedAnswer.value = answer
}

function getNextAnswerOrder(): number {
    return quizRequest.answers.length + 1
}

function setLoading(loading: boolean): void {
    emit("update:loading", loading)
}
</script>

<style scoped></style>
