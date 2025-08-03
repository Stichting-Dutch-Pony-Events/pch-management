import type { BaseSearchRequest } from "./base-search.request"

export interface AttendeeSearchRequest extends BaseSearchRequest {
    productId?: string | null
}
