<template>
    <v-form v-model="formValid" ref="formRef" class="fill-height" @submit.prevent="submit">
        <v-card :loading="computedLoading" class="fill-height d-flex flex-column">
            <v-card-item>
                <v-card-title>Attendee</v-card-title>
                <v-card-subtitle>
                    This data is managed by pretix, changes here will be overriden when new data is loaded from pretix
                </v-card-subtitle>
            </v-card-item>
            <v-card-text v-if="attendee" class="flex-grow-1">
                <v-list-item class="ml-0 pl-0 mb-4">
                    <template #prepend>
                        <v-icon size="x-large">mdi-ticket</v-icon>
                    </template>
                    <h2>{{ attendee.product?.name }}</h2>
                </v-list-item>
                <v-row>
                    <v-col cols="12" lg="5">
                        <v-text-field
                            :model-value="attendeeRequest.firstName"
                            label="First Name"
                            prepend-icon="mdi-card-account-details"
                            append-inner-icon="mdi-pencil-off"
                            readonly
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" lg="3">
                        <v-text-field
                            :model-value="attendeeRequest.middleName"
                            label="Middle Name"
                            append-inner-icon="mdi-pencil-off"
                            readonly
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" lg="4">
                        <v-text-field
                            :model-value="attendeeRequest.familyName"
                            label="Last Name"
                            append-inner-icon="mdi-pencil-off"
                            readonly
                        ></v-text-field>
                    </v-col>
                </v-row>

                <v-text-field
                    :model-value="attendeeRequest.nickName"
                    label="Nickname"
                    prepend-icon="mdi-label"
                    readonly
                ></v-text-field>

                <v-text-field
                    :model-value="attendeeRequest.email"
                    label="Email"
                    prepend-icon="mdi-email"
                    readonly
                ></v-text-field>
                <v-row>
                    <v-col cols="12" md="6" lg="3">
                        <v-text-field
                            :model-value="attendeeRequest.orderCode"
                            label="Order Code"
                            prepend-icon="mdi-invoice-list"
                            append-inner-icon="mdi-pencil-off"
                            readonly
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6" lg="3">
                        <v-text-field
                            :model-value="attendeeRequest.ticketId"
                            label="Ticket ID"
                            prepend-icon="mdi-ticket"
                            append-inner-icon="mdi-pencil-off"
                            readonly
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6" lg="3">
                        <v-text-field
                            :model-value="attendeeRequest.nfcTagId"
                            label="Badge ID"
                            prepend-icon="mdi-nfc-tap"
                            append-inner-icon="mdi-pencil-off"
                            readonly
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6" lg="3">
                        <v-text-field
                            :model-value="attendeeRequest.miniIdentifier"
                            label="Mini Identifier"
                            prepend-icon="mdi-qrcode"
                            append-inner-icon="mdi-pencil-off"
                            hint="The identifier that is on the badge QR code"
                            readonly
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-select
                    v-model="attendeeRequest.overrideBadgeProductId"
                    :items="computedProductList"
                    prepend-icon="mdi-badge-account-horizontal"
                    label="Override Badge Product"
                    item-value="id"
                    item-title="title"
                    :return-object="false"
                ></v-select>
            </v-card-text>
            <v-skeleton-loader type="article, text@5, list-item-avatar" v-if="attendee === null"></v-skeleton-loader>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    type="submit"
                    color="success"
                    prepend-icon="mdi-content-save"
                    size="large"
                    :loading="computedLoading"
                    @click="retrieveProducts"
                >
                    Save
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
</template>

<script setup lang="ts">
import { type Attendee, type AttendeeRequest, type Product } from "@/types"
import { computed, type ComputedRef, reactive, ref, type Ref, useTemplateRef, watch } from "vue"
import type { VForm } from "vuetify/components"
import { HttpClientError, useHttpClient } from "@/plugins/api"
import { useMessageStore } from "@/plugins/pinia/message-store"

const api = useHttpClient()
const messageStore = useMessageStore()

interface Props {
    attendee: Attendee | null
    loading: boolean
}

const props = withDefaults(defineProps<Props>(), {
    attendee: null,
    loading: false,
})

const emit = defineEmits<{
    (e: "update:attendee", value: Attendee): void
}>()

const formRef: Ref<VForm | null> = useTemplateRef<VForm>("formRef")
const formValid: Ref<boolean> = ref(false)
const formLoading: Ref<boolean> = ref<boolean>(false)
const products: Ref<Product[] | null> = ref<Product[] | null>(null)

const computedLoading: ComputedRef<boolean> = computed(() => {
    return props.loading || formLoading.value
})

const computedProductList = computed(() => {
    const overrideProducts: { id: null | string; title: string }[] = [
        { id: null, title: "Do not override badge (use: " + props.attendee?.product?.name + ")" },
    ]

    if (products.value) {
        for (const product of products.value) {
            overrideProducts.push({
                id: product.id,
                title: product.name,
            })
        }
    }

    return overrideProducts
})

const attendeeRequest: AttendeeRequest = reactive<AttendeeRequest>({
    name: "",
    firstName: "",
    middleName: null,
    familyName: "",
    nickName: null,
    email: "",
    orderCode: "",
    ticketId: 0,
    nfcTagId: null,
    productId: null,
    miniIdentifier: null,
    fireBaseToken: null,
    overrideBadgeProductId: null,
})

watch(
    () => props.attendee,
    () => {
        populateAttendeeRequest()
    },
    { immediate: true, deep: true }
)

function populateAttendeeRequest(): void {
    if (props.attendee) {
        attendeeRequest.name = props.attendee.name
        attendeeRequest.firstName = props.attendee.firstName ?? ""
        attendeeRequest.middleName = props.attendee.middleName ?? null
        attendeeRequest.familyName = props.attendee.familyName ?? ""
        attendeeRequest.nickName = props.attendee.nickName
        attendeeRequest.email = props.attendee.email ?? null
        attendeeRequest.orderCode = props.attendee.orderCode ?? ""
        attendeeRequest.ticketId = props.attendee.ticketId ?? 0
        attendeeRequest.nfcTagId = props.attendee.nfcTagId ?? null
        attendeeRequest.productId = props.attendee.product?.id ?? null
        attendeeRequest.miniIdentifier = props.attendee.miniIdentifier ?? null
        attendeeRequest.fireBaseToken = props.attendee.fireBaseToken ?? null
        attendeeRequest.overrideBadgeProductId = props.attendee.overrideBadgeProduct?.id ?? null
    }
}

void retrieveProducts()
async function retrieveProducts(): Promise<void> {
    try {
        products.value = await api.productService.listProducts()
    } catch (e) {
        if (e instanceof HttpClientError) {
            messageStore.addMessage({
                color: "error",
                text: e.message,
                timeout: 5000,
            })
        } else {
            messageStore.addMessage({
                text: "An unexpected error occurred while fetching products.",
                color: "error",
                timeout: 5000,
            })
        }
    }
}

async function submit(): Promise<void> {
    if (props.attendee === null) {
        return
    }

    if (formRef.value && !(await formRef.value.validate())) {
        return
    }

    formLoading.value = true
    try {
        const updatedAttendee = await api.attendeeService.updateAttendee(props.attendee.id, attendeeRequest)

        messageStore.addMessage({
            text: "Attendee updated successfully.",
            color: "success",
            timeout: 3000,
        })

        // Emit the updated attendee to the parent component
        emit("update:attendee", updatedAttendee)
    } catch (error) {
        if (error instanceof HttpClientError) {
            messageStore.addMessage({
                text: error.message,
                color: "error",
                timeout: 5000,
            })
        } else {
            console.error("Failed to save attendee:", error)
        }
    } finally {
        formLoading.value = false
    }
}
</script>

<style scoped></style>
