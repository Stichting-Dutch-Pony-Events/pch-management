import type { Attendee } from "../"

export interface MainStoreState {
    authToken: string | null
    user: Attendee | null
}
