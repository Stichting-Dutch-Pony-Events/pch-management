import { HttpClient } from "@/plugins/api/HttpClient"

declare module "*.vue"

declare module "vue" {
    interface ComponentCustomProperties {
        $api: HttpClient
    }
}
