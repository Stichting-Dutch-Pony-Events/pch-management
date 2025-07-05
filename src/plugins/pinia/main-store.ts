import { defineStore, type StoreDefinition } from "pinia"
import type { Attendee } from "@/types"

export const useMainStore: StoreDefinition<"main", MainStore> = defineStore("main", {
    state: (): MainStore => ({
        // Example state property
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

export interface MainStore {
    authToken: string | null
    user: Attendee | null
}
