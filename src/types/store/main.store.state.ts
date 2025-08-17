import type { Attendee, AttendeeSearchRequest } from "../"

export interface MainStoreState {
    authToken: string | null
    user: Attendee | null
    attendeeSearchRequest: AttendeeSearchRequest
}
