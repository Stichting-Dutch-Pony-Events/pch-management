<template>
    <v-card class="d-flex flex-column fill-height w-100">
        <v-card-item>
            <v-card-title>Answers</v-card-title>
        </v-card-item>
        <v-card-text class="flex-grow-0">
            <span class="d-block font-weight-bold mb-1">{{ question.order }}. {{ question.title }}</span>
            {{ question.question }}
        </v-card-text>
        <v-list>
            <v-list-item :to="{ name: 'QuizOverview', params: { quizQuestionId: question.id, quizAnswerId: 'create' } }">
                <template v-slot:prepend>
                    <v-icon>mdi-plus</v-icon>
                </template>
                <v-list-item-title>Create Answer</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-card>
</template>

<script setup lang="ts">
import type { QuizQuestion } from "@/types"

interface Props {
    question: QuizQuestion
}

const props = defineProps<Props>()
</script>

<style scoped></style>
