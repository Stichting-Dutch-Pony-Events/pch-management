<template>
    <div class="d-flex flex-column fill-height w-100">
        <v-toolbar class="mb-4">
            <v-toolbar-title style="max-width: 300px; flex: inherit">
                <v-icon>mdi-horse</v-icon>
                Attendees
            </v-toolbar-title>
        </v-toolbar>

        <v-row>
            <v-col class="v-col-12 v-col-lg-2">
                <v-text-field v-model="searchRequest.query" label="Search (Name, Email, Nick name)"></v-text-field>
            </v-col>
            <v-col class="v-col-12 v-col-lg-2">
                <v-select v-model="searchRequest.productId" :return-object="false" item-value="value" item-title="title" :items="products" label="Product"></v-select>
            </v-col>
        </v-row>

        <v-data-table-server
            v-model:items-per-page="searchRequest.itemsPerPage"
            v-model:page="searchRequest.page"
            v-model:sort-by="searchRequest.sortBy"
            v-model:search="searchRequest.query"
            :loading="loading"
            :headers="headers"
            :items-per-page-options="itemsPerPageOptions"
            :items-length="searchResponse.total"
            :items="searchResponse.items"
            :fixed-header="true"
            :fixed-footer="true"
            :multi-sort="true"
            item-value="id"
            class="full-page-table fill-height"
            @update:page="fetchAttendees"
            @update:items-per-page="fetchAttendees"
            @update:sort-by="fetchAttendees"
            :row-props="
                ({ item }) => ({
                    onClick: () => selectAttendee(item),
                    class: 'cursor-pointer',
                })
            "
        >
            <template #item.actions>
                <v-btn variant="text" icon="mdi-chevron-right" density="compact"></v-btn>
            </template>
        </v-data-table-server>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, type Ref, watch } from "vue"
import type { DataTableHeader } from "vuetify/framework"
import type { Attendee, AttendeeSearchRequest, AttendeeSearchResponse } from "@/types"
import { HttpClientError, useHttpClient } from "@/plugins/api"
import { useMessageStore } from "@/plugins/pinia/message-store"
import { useRouter } from "vue-router"

interface ProductSelectOption {
    title: string
    value: string | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => any>(func: T, delay = 300): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>
    return (...args: Parameters<T>) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), delay)
    }
}

const api = useHttpClient()
const messageStore = useMessageStore()
const router = useRouter()

const loading: Ref<boolean> = ref(false)
const searchRequest: AttendeeSearchRequest = reactive<AttendeeSearchRequest>({
    query: "",
    productId: "",
    page: 1,
    itemsPerPage: 10,
    sortBy: [{ key: "name", order: "asc" }],
})

const searchResponse: Ref<AttendeeSearchResponse> = ref<AttendeeSearchResponse>({
    items: [],
    total: 0,
    page: 1,
    itemsPerPage: 10,
})

const itemsPerPageOptions: { title: string; value: number }[] = [
    { title: "10", value: 10 },
    { title: "25", value: 25 },
    { title: "50", value: 50 },
    { title: "100", value: 100 },
]
const headers: DataTableHeader[] = [
    { title: "Name", value: "name", sortable: true },
    { title: "Nick Name", value: "nickName", sortable: true },
    { title: "Email", value: "email", sortable: true },
    { title: "Product", value: "product.name", sortable: true },
    { title: "Actions", value: "actions", sortable: false, align: "end" },
]

const products: Ref<ProductSelectOption[]> = ref<ProductSelectOption[]>([{ value: "", title: "All Products" }])

const debouncedFetchAttendees = debounce(fetchAttendees, 300)

watch(
    () => searchRequest.query,
    () => {
        searchRequest.page = 1 // reset to first page on new search
        debouncedFetchAttendees()
    }
)

watch(
    () => searchRequest.productId,
    () => {
        searchRequest.page = 1 // reset to first page on new search
        void fetchAttendees()
    }
)

void fetchAttendees()
async function fetchAttendees() {
    loading.value = true
    try {
        searchResponse.value = await api.attendeeService.searchAttendees(searchRequest)
    } catch (e) {
        if (e instanceof HttpClientError) {
            messageStore.addMessage({
                color: "error",
                text: e.message,
                timeout: 5000,
            })
        } else {
            messageStore.addMessage({ text: "An unexpected error occurred while fetching attendees.", color: "error", timeout: 5000 })
        }
    } finally {
        loading.value = false
    }
}

void fetchProducts()
async function fetchProducts() {
    try {
        const productList = await api.productService.listProducts()
        products.value = [{ value: "", title: "All Products" }, ...productList.map((p) => ({ value: p.id, title: p.name }))]

        // If a product is selected, ensure it exists in the list
        if (searchRequest.productId && !products.value.some((p) => p.value === searchRequest.productId)) {
            searchRequest.productId = null // Reset if not found
        }
    } catch (e) {
        if (e instanceof HttpClientError) {
            messageStore.addMessage({
                color: "error",
                text: e.message,
                timeout: 5000,
            })
        } else {
            messageStore.addMessage({ text: "An unexpected error occurred while fetching products.", color: "error", timeout: 5000 })
        }
    }
}

function selectAttendee(item: Attendee): void {
    void router.push({
        name: "attendee-details",
        params: { attendeeId: item.id },
    })
}
</script>

<style scoped></style>
