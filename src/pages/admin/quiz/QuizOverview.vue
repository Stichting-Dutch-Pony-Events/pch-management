<template>
    <v-row class="fill-height">
        <v-col class="fill-height v-col-3 py-0">
            <v-card class="d-flex flex-column fill-height w-100">
                <v-card-item>
                    <v-card-title>Questions</v-card-title>
                </v-card-item>
                <v-list>
                    <quiz-question-form :question="null" @question-created="addQuestion"></quiz-question-form>
                    <quiz-question-form
                        v-for="(question, index) in quizQuestions"
                        :question="question"
                        :key="question.id"
                        @update:question="value => quizQuestions[index] = value"
                    />
                </v-list>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import QuizQuestionForm from "@/pages/admin/quiz/QuizQuestionForm.vue"
import { useHttpClient } from "@/plugins/api"
import { type Ref, ref } from "vue"
import type { QuizQuestion } from "@/types"

const api = useHttpClient()
const quizQuestions: Ref<QuizQuestion[]> = ref<QuizQuestion[]>([])
const loading: Ref<boolean> = ref<boolean>(false)

void getQuizQuestions();
async function getQuizQuestions(): Promise<void> {
    try {
        loading.value = true;
        quizQuestions.value = await api.quizService.getList()
    } finally {
        loading.value = false;
    }
}

function addQuestion(quizQuestion: QuizQuestion): void {
    quizQuestions.value.push(quizQuestion)
}
</script>

<style scoped></style>
