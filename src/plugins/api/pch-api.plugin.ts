import { type App, inject, type Plugin } from "vue"
import { HttpClient } from "@/plugins/api/HttpClient"

declare module "vue" {
    interface ComponentCustomProperties {
        $api: HttpClient
    }
}

export function createPchApi(): Plugin {
    const install = (app: App) => {
        const api = new HttpClient(import.meta.env.VITE_API_URL)
        app.config.globalProperties.$api = api

        app.provide("api", api)
    }

    return {
        install,
    }
}

export const useHttpClient = (): HttpClient => {
    const api: HttpClient | undefined = inject<HttpClient>("api")

    if (api === undefined) {
        throw new Error("HttpClient is not provided. Make sure to use the createPchApi plugin.")
    }

    return api
}
