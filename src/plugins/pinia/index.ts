import type { RouteLocation, Router } from "vue-router"
import { createPinia } from "pinia"
import { useMainStore } from "@/plugins/pinia/main-store"
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"

export default function createStore(router: Router) {
    const pinia = createPinia()
    pinia.use(piniaPluginPersistedstate)

    router.beforeEach((to: RouteLocation) => {
        const store = useMainStore()

        if (!to.meta.guestRoute && !store.authToken) return "/login"
    })

    return pinia
}
