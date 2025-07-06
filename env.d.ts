/// <reference types="vite/client" />
/// <reference types="unplugin-vue-router/client" />
interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_OIDC_AUTHORITY: string
    readonly VITE_OIDC_CLIENT_ID: string
    readonly VITE_OIDC_REDIRECT_URI: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
