import { TimetableLocationType } from "@/types"

export interface TimetableLocationRequest {
    title: string
    timetableLocationType: TimetableLocationType
    timetableDays: string[]
}
