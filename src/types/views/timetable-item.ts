import type { EntityView } from "./entity-view"
import type { Attendee } from "./"

export interface TimetableItem extends EntityView {
    title: string
    description?: string | null
    startTime: string
    endTime: string
    timetableLocationId: string
    volunteer?: Attendee | null
}
