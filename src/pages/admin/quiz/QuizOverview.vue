<template>
    <v-row class="fill-height">
        <v-col class="fill-height v-col-3 py-0">
            <v-card class="d-flex flex-column fill-height w-100" :loading="loading">
                <v-card-item>
                    <v-card-title>Questions</v-card-title>
                </v-card-item>
                <v-list>
                    <quiz-question-form :question="null" @question-created="addQuestion"></quiz-question-form>
                    <draggable
                        v-model="quizQuestions"
                        @change="orderChanged"
                        item-key="id"
                        tag="div"
                        animation="200"
                        handle=".drag-handle"

                    >
                        <template #item="{ element: question, index }">
                            <div>
                                <quiz-question-form
                                    :question="question"
                                    :key="question.id"
                                    @update:question="(value) => (quizQuestions[index] = value)"
                                >
                                    <template v-slot:handle>
                                        <v-icon :class="{'drag-handle': !loading}" v-show="!loading">mdi-drag</v-icon>
                                        <v-progress-circular indeterminate v-if="loading" size="16"></v-progress-circular>
                                    </template>
                                </quiz-question-form>
                            </div>
                        </template>
                    </draggable>
                </v-list>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import draggable from "vuedraggable"
import QuizQuestionForm from "@/pages/admin/quiz/QuizQuestionForm.vue"
import { useHttpClient } from "@/plugins/api"
import { type Ref, ref } from "vue"
import type { QuizQuestion } from "@/types"
import type { ChangeOrderRequest } from "@/types/requests/change-order.request"

const api = useHttpClient()
const quizQuestions: Ref<QuizQuestion[]> = ref<QuizQuestion[]>([])
const loading: Ref<boolean> = ref<boolean>(false)

void getQuizQuestions()

async function getQuizQuestions(): Promise<void> {
    try {
        loading.value = true
        quizQuestions.value = await api.quizService.getList()
    } finally {
        loading.value = false
    }
}

function addQuestion(quizQuestion: QuizQuestion): void {
    quizQuestions.value.push(quizQuestion)
}

async function orderChanged(): Promise<void> {
    const changeOrderRequest: ChangeOrderRequest = {
        ids: []
    }

    for (let index = 0; index < quizQuestions.value.length; index++) {
        quizQuestions.value[index].order = index + 1
        changeOrderRequest.ids.push(quizQuestions.value[index].id)
    }

    try {
        loading.value = true
        await api.quizService.changeQuestionOrder(changeOrderRequest);
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.drag-handle {
    cursor: grab;
}
</style>
