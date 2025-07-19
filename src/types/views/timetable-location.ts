import type { EntityView } from "./entity-view"
import { TimetableLocationType } from "../enum"
import type { TimetableDay } from "./"

export interface TimetableLocation extends EntityView {
    title: string
    order: number
    timetableLocationType: TimetableLocationType
    timetableDays: TimetableDay[]
}
