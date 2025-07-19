<template>
    <v-dialog v-model="isDialogOpen" max-width="512px" persistent>
        <template v-slot:activator="{ props: activatorProps }">
            <v-divider v-if="props.createMode"></v-divider>
            <v-list-item v-bind="activatorProps">
                <template v-slot:prepend>
                    <v-icon v-if="props.createMode">mdi-plus</v-icon>
                    <slot name="handle"></slot>
                </template>
                <v-list-item-title v-if="props.createMode">Create {{ props.typeName }}</v-list-item-title>
                <v-list-item-title v-else>
                    <slot name="title">{{ props.titleText }}</slot>
                </v-list-item-title>
                <template v-slot:append>
                    <confirm-dialog v-if="!props.createMode" :message="`You will be deleting the ${props.typeName}: ${props.titleText}`" @confirm="$emit('delete')" />
                </template>
            </v-list-item>
        </template>

        <template v-slot:default="{ isActive }">
            <v-form ref="formRef" v-model="isFormValid" @submit.prevent="submitForm">
                <v-card :loading="props.loading">
                    <v-card-item>
                        <v-card-title>{{ props.createMode ? "Create" : "Edit" }} {{ props.typeName }}</v-card-title>
                    </v-card-item>

                    <v-card-text>
                        <slot name="form-fields"></slot>
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
import ConfirmDialog from "@/components/ConfirmDialog.vue"
import { computed, type ComputedRef, ref, type Ref } from "vue"
import type { VForm } from "vuetify/components"

interface Props {
    dialogOpen: boolean
    createMode: boolean
    formValid: boolean
    typeName: string
    titleText: string
    loading: boolean
}

const props = withDefaults(defineProps<Props>(), {
    dialogOpen: false,
    createMode: false,
    formValid: false,
    typeName: "",
    titleText: "",
    loading: false,
})

const emit = defineEmits<{
    (e: "update:dialog-open", value: boolean): void
    (e: "update:form-valid", value: boolean): void
    (e: "submit-form"): void
    (e: "delete"): void
}>()

const formRef: Ref<VForm | null> = ref<VForm | null>(null)

const isFormValid: ComputedRef<boolean> = computed({
    get: () => props.formValid,
    set: (value: boolean) => emit("update:form-valid", value),
})

const isDialogOpen: ComputedRef<boolean> = computed({
    get: () => props.dialogOpen,
    set: (value: boolean) => emit("update:dialog-open", value),
})

async function submitForm(): Promise<void> {
    if (await formRef.value?.validate()) {
        emit("submit-form")
    }
}
</script>

<style scoped></style>
