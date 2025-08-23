import { defineStore, type StoreDefinition } from "pinia"
import type { AttendeeStoreState } from "@/types"
import { reactive } from "vue"

export const useAttendeeStore: StoreDefinition<"attendee", AttendeeStoreState> = defineStore("attendee", {
    state: (): AttendeeStoreState => ({
        attendeeSearchRequest: reactive({
            productId: "",
            role: "",
            query: "",
            page: 1,
            itemsPerPage: 10,
            sortBy: [{ key: "name", order: "asc" }],
        }),
        attendeeSelectSearchRequest: reactive({
            productId: "",
            role: "",
            query: "",
            page: 1,
            itemsPerPage: 10,
            sortBy: [{ key: "name", order: "asc" }],
        }),
    }),
})

export type AttendeeStore = ReturnType<typeof useAttendeeStore>
