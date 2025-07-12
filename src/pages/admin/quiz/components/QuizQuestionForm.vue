<template>
    <v-dialog v-model="dialogOpen" max-width="512px" persistent>
        <template v-slot:activator>
            <v-divider v-if="props.question !== null"></v-divider>
            <v-list-item @click="open" :active="selected">
                <template v-slot:prepend>
                    <v-icon v-if="props.question === null">mdi-plus</v-icon>
                    <slot name="handle"></slot>
                </template>
                <v-list-item-title v-if="props.question === null">Create Question</v-list-item-title>
                <v-list-item-title v-else>{{ props.question?.order }}. {{ props.question?.title }}</v-list-item-title>
                <template v-slot:append>
                    <v-btn @click="dialogOpen = true" variant="plain" icon="mdi-pencil" v-if="props.question !== null" density="compact" />
                    <confirm-dialog v-if="props.question !== null" :message="`You will be deleting the Quiz Question: ${props.question.title}`" @confirm="emit('delete-question', props.question)" />
                </template>
            </v-list-item>
        </template>

        <template v-slot:default="{ isActive }">
            <v-form v-model="formValid" @submit.prevent="saveQuestion">
                <v-card :loading="loading">
                    <v-card-item>
                        <v-card-title v-if="props.question === null">Create Question</v-card-title>
                        <v-card-title v-else>Edit Question</v-card-title>
                    </v-card-item>

                    <v-card-text>
                        <v-text-field v-model="questionRequest.title" :rules="rules.title" label="Title" counter="50" hint="Won't be shown in app, just for our reference"></v-text-field>
                        <v-textarea v-model="questionRequest.question" :rules="rules.question" label="Question" counter="500" auto-grow></v-textarea>
                    </v-card-text>

                    <template v-slot:actions>
                        <v-btn @click="isActive.value = false">Cancel</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn type="submit" :disabled="loading">Save</v-btn>
                    </template>
                </v-card>
            </v-form>
        </template>
    </v-dialog>
</template>

<script setup lang="ts">
import type { QuizQuestion, QuizQuestionRequest } from "@/types"
import { reactive, ref, type Ref, watch } from "vue"
import { useHttpClient } from "@/plugins/api"
import { useMessageStore } from "@/plugins/pinia/message-store"
import ConfirmDialog from "@/components/ConfirmDialog.vue"

interface Props {
    question: QuizQuestion | null
    selected: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
    (e: "update:question", value: QuizQuestion): void
    (e: "question-created", value: QuizQuestion): void
    (e: "open-question", value: QuizQuestion): void
    (e: "delete-question", value: QuizQuestion): void
}>()

const api = useHttpClient()
const messageStore = useMessageStore()
const questionRequest: QuizQuestionRequest = reactive<QuizQuestionRequest>({
    title: "",
    question: "",
})

const dialogOpen: Ref<boolean> = ref(false)
const loading: Ref<boolean> = ref(false)
const formValid: Ref<boolean> = ref(false)
const rules = {
    title: [(v: string) => !!v || "This field is required", (v: string) => v.length >= 3 || "Minimum 3 characters", (v: string) => v.length <= 50 || "Maximum 50 characters"],
    question: [(v: string) => !!v || "This field is required", (v: string) => v.length >= 3 || "Minimum 3 characters", (v: string) => v.length <= 500 || "Maximum 500 characters"],
}

watch(
    () => dialogOpen,
    (dialogOpen: Ref<boolean>): void => {
        if (dialogOpen.value) {
            questionRequest.title = props.question?.title ?? ""
            questionRequest.question = props.question?.question ?? ""
        }
    },
    { immediate: true, deep: true }
)

async function saveQuestion(): Promise<void> {
    if (formValid.value) {
        try {
            loading.value = true
            if (props.question === null) {
                // Create new question
                const question = await api.quizService.createQuizQuestion(questionRequest)

                messageStore.addMessage({
                    color: "success",
                    text: "Question created successfully.",
                    timeout: 3000,
                })

                emit("question-created", question)
                dialogOpen.value = false
            } else {
                // Update existing question
                const updatedQuestion = await api.quizService.updateQuizQuestion(props.question.id, questionRequest)

                messageStore.addMessage({
                    color: "success",
                    text: "Question updated successfully.",
                    timeout: 3000,
                })

                emit("update:question", updatedQuestion)
                dialogOpen.value = false
            }
        } finally {
            loading.value = false
        }
    }
}

function open(): void {
    if (props.question === null) {
        dialogOpen.value = true
    } else {
        emit("open-question", props.question)
    }
}
</script>

<style scoped></style>
