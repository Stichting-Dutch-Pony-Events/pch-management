<template>
    <v-row class="fill-height">
        <v-col class="fill-height v-col-3 py-0">
            <v-card class="d-flex flex-column fill-height w-100" :loading="loading">
                <v-card-item>
                    <v-card-title>Questions</v-card-title>
                </v-card-item>
                <v-list>
                    <quiz-question-form :question="null" :selected="false" @question-created="addQuestion"></quiz-question-form>
                    <draggable v-model="quizQuestions" @change="orderChanged" item-key="id" tag="div" animation="200" handle=".drag-handle">
                        <template #item="{ element: question, index }">
                            <div>
                                <quiz-question-form
                                    :question="question"
                                    :selected="question === selectedQuestion"
                                    :key="question.id"
                                    @update:question="(value) => (quizQuestions[index] = value)"
                                    @open-question="openQuestion"
                                    @delete-question="deleteQuestion"
                                >
                                    <template v-slot:handle>
                                        <v-icon :class="{ 'drag-handle': !loading }" v-show="!loading">mdi-drag</v-icon>
                                        <v-progress-circular indeterminate v-if="loading" size="16"></v-progress-circular>
                                    </template>
                                </quiz-question-form>
                            </div>
                        </template>
                    </draggable>
                </v-list>
            </v-card>
        </v-col>
        <v-col class="fill-height v-col-3 py-0">
            <quiz-answer-list
                v-if="selectedQuestion !== null"
                :question="selectedQuestion"
                :answers="quizAnswers"
                :loading="loadingAnswers"
                @update:answers="(value) => (quizAnswers = value)"
                @change-order="answerOrderChanged"
                @delete-answer="deleteAnswer"
            ></quiz-answer-list>
        </v-col>
        <v-col class="fill-height v-col-6 py-0">
            <quiz-answer-form v-if="showAnswerForm && selectedQuestion !== null" :quiz-question="selectedQuestion" v-model:quiz-answer="selectedAnswer" @answer-created="addAnswer"></quiz-answer-form>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import draggable from "vuedraggable"
import QuizQuestionForm from "@/pages/admin/quiz/components/QuizQuestionForm.vue"
import { HttpClientError, useHttpClient } from "@/plugins/api"
import { computed, type ComputedRef, type Ref, ref, watch } from "vue"
import type { QuizAnswer, QuizQuestion } from "@/types"
import type { ChangeOrderRequest } from "@/types/requests/change-order.request"
import { useRoute, useRouter } from "vue-router"
import QuizAnswerList from "@/pages/admin/quiz/components/QuizAnswerList.vue"
import QuizAnswerForm from "@/pages/admin/quiz/components/QuizAnswerForm.vue"
import { useMessageStore } from "@/plugins/pinia/message-store"

const api = useHttpClient()
const quizQuestions: Ref<QuizQuestion[]> = ref<QuizQuestion[]>([])
const quizAnswers: Ref<QuizAnswer[]> = ref<QuizAnswer[]>([])

const loading: Ref<boolean> = ref<boolean>(false)
const loadingAnswers: Ref<boolean> = ref<boolean>(false)
const route = useRoute()
const router = useRouter()
const messageStore = useMessageStore()

void getQuizQuestions()

const selectedQuestion: ComputedRef<QuizQuestion | null> = computed(() => {
    if (route.params.quizQuestionId) {
        return quizQuestions.value.find((q) => q.id === route.params.quizQuestionId) || null
    }

    return null
})

const selectedAnswer: ComputedRef<QuizAnswer | null> = computed({
    get(): QuizAnswer | null {
        if (route.params.quizAnswerId) {
            return quizAnswers.value.find((a) => a.id === route.params.quizAnswerId) || null
        }

        return null
    },
    set(val: QuizAnswer | null): void {
        const index = quizAnswers.value.findIndex((a) => a.id === val?.id)

        if (index >= 0 && val !== null) {
            quizAnswers.value[index] = val
        }
    },
})

const showAnswerForm: ComputedRef<boolean> = computed(() => {
    return selectedAnswer.value !== null || route.params.quizAnswerId === "create"
})

watch(
    () => route.params.quizQuestionId,
    () => {
        void getQuizAnswers()
    },
    { immediate: true }
)

async function getQuizQuestions(): Promise<void> {
    try {
        loading.value = true
        quizQuestions.value = await api.quizService.getList()
    } finally {
        loading.value = false
    }
}

async function getQuizAnswers(): Promise<void> {
    let questionId: string | string[] | null = route.params.quizQuestionId
    if (questionId === undefined || questionId === null) {
        quizAnswers.value = []
        return
    }
    if (Array.isArray(questionId)) {
        questionId = questionId[0]
    }

    try {
        loadingAnswers.value = true
        quizAnswers.value = await api.quizService.getAnswers(questionId)
    } finally {
        loadingAnswers.value = false
    }
}

async function deleteQuestion(question: QuizQuestion): Promise<void> {
    try {
        loading.value = true
        await api.quizService.deleteQuizQuestion(question.id)
        quizQuestions.value = quizQuestions.value.filter((q) => q.id !== question.id)

        messageStore.addMessage({
            color: "success",
            text: `Question "${question.title}" deleted successfully.`,
            timeout: 3000,
        })
    } catch (error) {
        if (error instanceof HttpClientError) {
            messageStore.addMessage({
                color: "error",
                text: error.message,
                timeout: 5000,
            })
            return
        }
        console.error("Failed to delete question:", error)
    } finally {
        loading.value = false
    }
}

function addQuestion(quizQuestion: QuizQuestion): void {
    quizQuestions.value.push(quizQuestion)
}

async function orderChanged(): Promise<void> {
    const changeOrderRequest: ChangeOrderRequest = {
        ids: [],
    }

    for (let index = 0; index < quizQuestions.value.length; index++) {
        quizQuestions.value[index].order = index + 1
        changeOrderRequest.ids.push(quizQuestions.value[index].id)
    }

    try {
        loading.value = true
        await api.quizService.changeQuestionOrder(changeOrderRequest)
    } finally {
        loading.value = false
    }
}

function openQuestion(question: QuizQuestion): void {
    if (route.params.quizQuestionId === question.id) {
        // Already on the question, no need to navigate
        return
    }

    void router.push({ name: "QuizOverview", params: { quizQuestionId: question.id, quizAnswerId: undefined } })
}

function addAnswer(answer: QuizAnswer): void {
    quizAnswers.value.push(answer)
}

async function answerOrderChanged(): Promise<void> {
    if (selectedQuestion.value === null) {
        return
    }

    const changeOrderRequest: ChangeOrderRequest = {
        ids: [],
    }

    for (let index = 0; index < quizAnswers.value.length; index++) {
        quizAnswers.value[index].order = index + 1
        changeOrderRequest.ids.push(quizAnswers.value[index].id)
    }

    try {
        loadingAnswers.value = true
        await api.quizService.changeAnswerOrder(selectedQuestion.value.id, changeOrderRequest)
    } finally {
        loadingAnswers.value = false
    }
}

async function deleteAnswer(answer: QuizAnswer): Promise<void> {
    if (selectedQuestion.value === null) {
        return
    }

    try {
        loadingAnswers.value = true
        await api.quizService.deleteQuizAnswer(selectedQuestion.value.id, answer.id)
        quizAnswers.value = quizAnswers.value.filter((a) => a.id !== answer.id)

        messageStore.addMessage({
            color: "success",
            text: `Answer "${answer.title}" deleted successfully.`,
            timeout: 3000,
        })
    } catch (error) {
        if (error instanceof HttpClientError) {
            messageStore.addMessage({
                color: "error",
                text: error.message,
                timeout: 5000,
            })
            return
        }
        console.error("Failed to delete answer:", error)
    } finally {
        loadingAnswers.value = false
    }
}
</script>

<style scoped>
.drag-handle {
    cursor: grab;
}
</style>
