import { defineStore } from "pinia"

export const useMainStore = defineStore("main", {
    state: () => ({
        // Example state property
        user: null,
        authToken: null,
    }),
})
