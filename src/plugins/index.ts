/**
 * plugins/index.ts.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from "./vuetify"
import router from "../router"
import createStore from "./pinia"

// Types
import type { App } from "vue"
import { createPchApi } from "@/plugins/api/pch-api.plugin"

export function registerPlugins(app: App) {
    const store = createStore(router)
    const pchApi = createPchApi()

    app.use(vuetify).use(router).use(store).use(pchApi)
}
