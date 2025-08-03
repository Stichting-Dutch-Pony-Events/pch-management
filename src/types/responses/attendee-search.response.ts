import type { Attendee } from "../"

export interface AttendeeSearchResponse {
    items: Attendee[]
    total: number
    page: number
    itemsPerPage: number
}
