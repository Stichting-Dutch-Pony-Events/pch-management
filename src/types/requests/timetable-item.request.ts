export interface TimetableItemRequest {
    timetableLocationId: string
    timetableDayId: string
    title: string
    description?: string | null
    startTime: string
    endTime: string
    volunteerId?: string | null
}
