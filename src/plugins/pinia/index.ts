import type { RouteLocationRaw, Router } from "vue-router"
import { createPinia } from "pinia"
import { useMainStore } from "@/plugins/pinia/main-store"

export default function createStore(router: Router) {
    const pinia = createPinia()

    router.beforeEach((to: RouteLocationRaw) => {
        const store = useMainStore()

        if (!to.meta.guestRoute && !store.authToken) return '/login'
    })

    return pinia
}
