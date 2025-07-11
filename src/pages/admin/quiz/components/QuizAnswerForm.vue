<template>
    <v-card class="fill-height w-100">
        <v-form v-model="formValid">
            <v-card-item>
                <v-card-title v-if="props.quizAnswer === null">Create Answer</v-card-title>
                <v-card-title v-else>Edit Answer</v-card-title>
            </v-card-item>

            <v-card-text> </v-card-text>

            <v-card-actions>
                <v-btn variant="plain" :to="{ name: 'TeamsOverview' }">Cancel</v-btn>
                <v-spacer></v-spacer>
                <v-btn variant="plain" type="submit" :disabled="loading">Save</v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script setup lang="ts">
import type { QuizAnswer, QuizQuestion } from "@/types"
import { ref, type Ref } from "vue"

interface Props {
    quizQuestion: QuizQuestion
    quizAnswer: QuizAnswer | null
}

const props = withDefaults(defineProps<Props>(), {
    quizAnswer: null,
})

const loading: Ref<boolean> = ref(false)
const formValid: Ref<boolean> = ref(false)
</script>

<style scoped></style>
