<template>
    <v-card class="d-flex flex-column fill-height w-100" :loading="props.loading">
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
            <draggable :model-value="answers" @update:modelValue="onUpdateAnswers" @change="emit('change-order')" item-key="id" tag="div" animation="200" handle=".drag-handle">
                <template #item="{ element }">
                    <div>
                        <v-list-item @click.self="navigateToAnswer(question.id, element.id)" :active="isActive(element.id)" :key="element.id">
                            <template v-slot:prepend>
                                <v-icon :class="{ 'drag-handle': !loading }" v-show="!loading">mdi-drag</v-icon>
                                <v-progress-circular indeterminate v-if="loading" size="16"></v-progress-circular>
                            </template>
                            <v-list-item-title @click.self="navigateToAnswer(question.id, element.id)">{{ element.order }}. {{ element.title }}</v-list-item-title>
                            <template v-slot:append>
                                <confirm-dialog :message="`You will be deleting the Quiz Answer: ${element.title}`" @confirm="emit('delete-answer', element)"> </confirm-dialog>
                            </template>
                        </v-list-item>
                    </div>
                </template>
            </draggable>
        </v-list>
    </v-card>
</template>

<script setup lang="ts">
import draggable from "vuedraggable"
import type { QuizAnswer, QuizQuestion } from "@/types"
import ConfirmDialog from "@/components/ConfirmDialog.vue"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()

interface Props {
    question: QuizQuestion
    answers: QuizAnswer[]
    loading: boolean
}
const props = defineProps<Props>()

const emit = defineEmits<{
    (e: "update:answers", value: QuizAnswer[]): void
    (e: "delete-answer", value: QuizAnswer): void
    (e: "change-order"): void
}>()

function onUpdateAnswers(answers: QuizAnswer[]): void {
    emit("update:answers", answers)
}

function navigateToAnswer(quizQuestionId: string, quizAnswerId: string) {
    void router.push({
        name: "QuizOverview",
        params: { quizQuestionId: quizQuestionId, quizAnswerId: quizAnswerId },
    })
}

function isActive(answerId: string): boolean {
    return route.params.quizAnswerId === answerId
}
</script>

<style scoped></style>
