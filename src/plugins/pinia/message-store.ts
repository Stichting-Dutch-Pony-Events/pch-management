import { defineStore } from "pinia"
import type { MessageStoreState, SnackBarMessage } from "@/types"

export const useMessageStore = defineStore("message", {
    state: (): MessageStoreState => ({
        queue: [],
    }),
    actions: {
        addMessage(message: SnackBarMessage): void {
            this.queue.push(message)
        },
        clearMessages(): void {
            this.queue = []
        },
    },
})

export type MessageStore = ReturnType<typeof useMessageStore>
