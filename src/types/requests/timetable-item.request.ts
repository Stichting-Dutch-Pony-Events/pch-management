export interface TimetableItemRequest {
    timetableLocationId: string
    timetableDayId: string
    title: string
    description?: string | null
    startTime: string
    endTime: string
    colour: string
    volunteerId: string | null
}
