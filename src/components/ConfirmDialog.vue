<template>
    <v-dialog v-model="dialogOpen" max-width="500px">
        <template v-slot:activator="{ props: activatorProps }">
            <slot name="activator" v-bind="activatorProps"></slot>
            <template v-if="!$slots.activator">
                <v-btn @click.stop v-bind="activatorProps" color="error" variant="text" icon="mdi-delete" density="compact"></v-btn>
            </template>
        </template>

        <v-card>
            <v-card-item>
                <v-card-title>Are you sure?</v-card-title>
            </v-card-item>
            <v-alert color="warning">This action cannot be undone.</v-alert>
            <v-card-text>
                {{ props.message }}
            </v-card-text>
            <v-card-actions>
                <v-btn variant="text" @click="dialogOpen = false">{{ props.cancelText }}</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="error" variant="text" @click="confirm">{{ props.confirmText }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, type Ref } from "vue"

interface Props {
    message?: string
    confirmText?: string
    cancelText?: string
}

const props = withDefaults(defineProps<Props>(), {
    message: "Are you sure you want to delete this item?",
    confirmText: "Yes, delete",
    cancelText: "No, Cancel",
})

const emit = defineEmits<{
    (e: "confirm"): void
}>()

const dialogOpen: Ref<boolean> = ref(false)

function confirm(): void {
    dialogOpen.value = false
    emit("confirm")
}
</script>

<style scoped></style>
