import { defineStore, type StoreDefinition } from "pinia"
import type { MainStoreState } from "@/types"
import { reactive } from "vue"

export const useMainStore: StoreDefinition<"main", MainStoreState> = defineStore("main", {
    state: (): MainStoreState => ({
        user: null,
        authToken: null,
        attendeeSearchRequest: reactive({
            productId: "",
            role: "",
            query: "",
            page: 1,
            itemsPerPage: 10,
            sortBy: [{ key: "name", order: "asc" }],
        }),
    }),
    persist: [
        {
            pick: ["authToken", "user"],
            storage: sessionStorage,
        },
    ],
})

export type MainStore = ReturnType<typeof useMainStore>
