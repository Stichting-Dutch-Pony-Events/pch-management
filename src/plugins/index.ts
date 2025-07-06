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
import { createOidcClient } from "@/plugins/oidc-client"

export function registerPlugins(app: App) {
    const store = createStore()
    const oidcClient = createOidcClient(router)
    const pchApi = createPchApi()

    app.use(vuetify).use(router).use(store).use(oidcClient).use(pchApi)
}
