import { defineStore, type StoreDefinition } from "pinia"
import type { MainStoreState } from "@/types"

export const useMainStore: StoreDefinition<"main", MainStoreState> = defineStore("main", {
    state: (): MainStoreState => ({
        user: null,
        authToken: null,
    }),
    persist: [
        {
            pick: ["authToken", "user"],
            storage: sessionStorage,
        },
    ],
})

export type MainStore = ReturnType<typeof useMainStore>
