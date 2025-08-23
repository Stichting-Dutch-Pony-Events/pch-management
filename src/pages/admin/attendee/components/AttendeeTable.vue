<template>
    <div class="d-flex flex-column fill-height w-100">
        <v-row>
            <v-col class="v-col-12 v-col-lg-3">
                <v-text-field v-model="searchRequest.query" label="Search (Name, Email, Nick name)"></v-text-field>
            </v-col>
            <v-col class="v-col-12 v-col-lg-2">
                <v-select
                    v-model="searchRequest.productId"
                    :return-object="false"
                    item-value="value"
                    item-title="title"
                    :items="products"
                    label="Product"
                ></v-select>
            </v-col>
            <v-col class="v-col-12 v-col-lg-3">
                <v-select
                    v-model="selectedRoles"
                    :items="availableRoles"
                    item-value="value"
                    item-title="label"
                    label="Role"
                    multiple
                >
                    <template v-slot:prepend-item>
                        <v-list-item title="Select All" @click="toggleSelectAllRoles">
                            <template v-slot:prepend>
                                <v-checkbox-btn
                                    :indeterminate="selectedRoles.length > 0 && !allRolesSelected"
                                    :model-value="allRolesSelected"
                                ></v-checkbox-btn>
                            </template>
                        </v-list-item>

                        <v-divider class="mt-2"></v-divider>
                    </template>
                    <template v-slot:selection="{ item, index }: { item: { value: RoleEnum }; index: number }">
                        <span v-if="allRolesSelected && index === 0">All Roles</span>
                        <v-chip v-if="!allRolesSelected && index < 2" :color="roleConfig[item.value].color">
                            {{ roleConfig[item.value].label }}
                        </v-chip>
                        <span v-if="!allRolesSelected && index === 2" class="text-grey text-caption align-self-center">
                            (+{{ selectedRoles.length - 2 }} others)
                        </span>
                    </template>
                </v-select>
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
                    onClick: () => emit('select-attendee', item),
                    class: 'cursor-pointer',
                })
            "
        >
            <template #[`item.actions`]>
                <v-btn variant="text" icon="mdi-chevron-right" density="compact"></v-btn>
            </template>
            <template #[`item.userRoles`]="{ item }">
                <v-chip
                    class="mx-1"
                    v-for="role in item.userRoles"
                    :key="`attendee-${item.id}-role-${role}`"
                    :color="roleConfig[role].color"
                >
                    {{ roleConfig[role].label }}
                </v-chip>
            </template>
        </v-data-table-server>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, type Ref, watch } from "vue"
import type { DataTableHeader } from "vuetify/framework"
import { type Attendee, type AttendeeSearchRequest, type AttendeeSearchResponse, RoleEnum } from "@/types"
import { HttpClientError, useHttpClient } from "@/plugins/api"
import { useMessageStore } from "@/plugins/pinia/message-store"

const api = useHttpClient()
const messageStore = useMessageStore()

interface Props {
    initialSelectedRoles: RoleEnum[] | null
    attendeeSearchRequest: AttendeeSearchRequest
}

const props = withDefaults(defineProps<Props>(), {
    initialSelectedRoles: null,
})

const emit = defineEmits<{
    (e: "select-attendee", value: Attendee): void
}>()

const loading: Ref<boolean> = ref(false)
const searchRequest: AttendeeSearchRequest = props.attendeeSearchRequest

const selectedRoles: Ref<RoleEnum[]> = ref<RoleEnum[]>([
    RoleEnum.USER,
    RoleEnum.VOLUNTEER,
    RoleEnum.INFOBOOTH,
    RoleEnum.STAFF,
    RoleEnum.SUPER_ADMIN,
])

void populateSelectedRoles()
function populateSelectedRoles() {
    if (props.initialSelectedRoles !== null) {
        selectedRoles.value = props.initialSelectedRoles
        return
    }

    if (searchRequest.role !== null && searchRequest.role !== undefined && searchRequest.role?.length > 0) {
        selectedRoles.value = searchRequest.role.split(",") as RoleEnum[]
    } else {
        selectedRoles.value = [
            RoleEnum.USER,
            RoleEnum.VOLUNTEER,
            RoleEnum.INFOBOOTH,
            RoleEnum.STAFF,
            RoleEnum.SUPER_ADMIN,
        ]
    }
}

const allRolesSelected = computed<boolean>(() => {
    return selectedRoles.value.length === availableRoles.length
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
    { title: "Roles", value: "userRoles" },
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

watch(selectedRoles, () => {
    searchRequest.page = 1

    void fetchAttendees()
})

function toggleSelectAllRoles() {
    if (allRolesSelected.value) {
        selectedRoles.value = []
    } else {
        selectedRoles.value = availableRoles.map((role) => role.value)
    }
}

const availableRoles = [
    { value: RoleEnum.USER, label: "Attendee" },
    { value: RoleEnum.VOLUNTEER, label: "Volunteer" },
    { value: RoleEnum.INFOBOOTH, label: "Info Booth Volunteer" },
    { value: RoleEnum.STAFF, label: "Con Staff" },
    { value: RoleEnum.SUPER_ADMIN, label: "Super Admin" },
]

const roleConfig = {
    [RoleEnum.USER]: { label: "Attendee", color: "blue-grey" },
    [RoleEnum.VOLUNTEER]: { label: "Volunteer", color: "lime" },
    [RoleEnum.INFOBOOTH]: { label: "Info Booth Volunteer", color: "amber" },
    [RoleEnum.STAFF]: { label: "Con Staff", color: "deep-orange" },
    [RoleEnum.SUPER_ADMIN]: { label: "Super Admin", color: "pink" },
}

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

void fetchAttendees()
async function fetchAttendees() {
    loading.value = true

    if (allRolesSelected.value && selectedRoles.value.length > 0) {
        searchRequest.role = ""
    } else {
        searchRequest.role = selectedRoles.value.join(",")
    }

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
            messageStore.addMessage({
                text: "An unexpected error occurred while fetching attendees.",
                color: "error",
                timeout: 5000,
            })
        }
    } finally {
        loading.value = false
    }
}

void fetchProducts()
async function fetchProducts() {
    try {
        const productList = await api.productService.listProducts()
        products.value = [
            { value: "", title: "All Products" },
            ...productList.map((p) => ({ value: p.id, title: p.name })),
        ]

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
            messageStore.addMessage({
                text: "An unexpected error occurred while fetching products.",
                color: "error",
                timeout: 5000,
            })
        }
    }
}
</script>

<style scoped></style>
