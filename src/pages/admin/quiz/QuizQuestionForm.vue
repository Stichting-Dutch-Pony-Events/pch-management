<template>
    <v-dialog
        v-model="dialogOpen"
        max-width="512px"
        persistent
    >
        <template v-slot:activator="{ props: activatorProps }">
            <v-divider v-if="props.question !== null"></v-divider>
            <v-list-item v-bind="activatorProps">
                <template v-slot:prepend>
                    <v-icon v-if="props.question === null">mdi-plus</v-icon>
                    <v-icon v-else>mdi-chat-question</v-icon>
                </template>
                <v-list-item-title v-if="props.question === null">Create Question</v-list-item-title>
                <v-list-item-title v-else>{{ props.question?.question }}</v-list-item-title>
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
                        <v-textarea
                            v-model="questionRequest.question"
                            :rules="rules.question"
                            label="Question"
                            counter="500"
                            auto-grow
                        ></v-textarea>
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

interface Props {
    question: QuizQuestion|null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    (e: "update:question", value: QuizQuestion): void
    (e: "question-created", value: QuizQuestion): void
}>()

const api = useHttpClient();
const messageStore = useMessageStore();
const questionRequest: QuizQuestionRequest = reactive<QuizQuestionRequest>({
    question: "",
})

const dialogOpen: Ref<boolean> = ref(false)
const loading: Ref<boolean> = ref(false)
const formValid: Ref<boolean> = ref(false)
const rules = {
    question: [(v: string) => !!v || "This field is required", (v: string) => v.length >= 3 || "Minimum 3 characters", (v: string) => v.length <= 500 || "Maximum 500 characters"],
}

watch(
    () => props.question,
    (question: QuizQuestion | null) => {
        questionRequest.question = question?.question ?? "";
    },
    { immediate: true }
)

async function saveQuestion(): Promise<void> {
    if(formValid.value) {
        try {
            loading.value = true;
            if(props.question === null) {
                // Create new question
                const question = await api.quizService.createQuizQuestion(questionRequest);

                messageStore.addMessage({
                    color: "success",
                    text: "Question created successfully.",
                    timeout: 3000
                });

                emit("question-created", question);
                dialogOpen.value = false;
            } else {
                // Update existing question
                const updatedQuestion = await api.quizService.updateQuizQuestion(props.question.id, questionRequest);

                messageStore.addMessage({
                    color: "success",
                    text: "Question updated successfully.",
                    timeout: 3000
                });

                emit("update:question", updatedQuestion);
                dialogOpen.value = false;
            }
        } finally {
            loading.value = false;
        }
    }
}
</script>

<style scoped>

</style>
