import type { HttpClient } from "@/plugins/api"
import { type TimetableItem, type TimetableItemRequest, TimetableLocationType } from "@/types"

export class TimetableItemService {
    constructor(private httpClient: HttpClient) {}

    public async getTimetableItems(timetableDayId: string, locationType: TimetableLocationType): Promise<TimetableItem[]> {
        return await this.httpClient.get(`api/v1/timetable/item?timetableDay=${timetableDayId}&locationType=${locationType}`)
    }

    public async createTimetableItem(timetableItemRequest: TimetableItemRequest): Promise<TimetableItem> {
        return await this.httpClient.post(`api/v1/timetable/item`, timetableItemRequest)
    }

    public async updateTimetableItem(timetableItemId: string, timetableItemRequest: TimetableItemRequest): Promise<TimetableItem> {
        return await this.httpClient.put(`api/v1/timetable/item/${timetableItemId}`, timetableItemRequest)
    }

    public async deleteTimetableItem(timetableItemId: string): Promise<void> {
        return await this.httpClient.delete(`api/v1/timetable/item/${timetableItemId}`)
    }
}
