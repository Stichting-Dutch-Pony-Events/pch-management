import type { HttpClient } from "@/plugins/api"
import { type ChangeOrderRequest, type TimetableLocation, type TimetableLocationRequest, TimetableLocationType } from "@/types"

export class TimetableLocationService {
    constructor(private httpClient: HttpClient) {}

    public async getTimetableLocations(timetableLocationType: TimetableLocationType): Promise<TimetableLocation[]> {
        return await this.httpClient.get(`api/v1/timetable/location/${timetableLocationType}`)
    }

    public async createTimetableLocation(timetableLocationRequest: TimetableLocationRequest): Promise<TimetableLocation> {
        return await this.httpClient.post(`api/v1/timetable/location`, timetableLocationRequest)
    }

    public async updateTimetableLocation(timetableLocationId: string, timetableLocationRequest: TimetableLocationRequest): Promise<TimetableLocation> {
        return await this.httpClient.put(`api/v1/timetable/location/${timetableLocationId}`, timetableLocationRequest)
    }

    public async changeTimetableLocationOrder(changeOrderRequest: ChangeOrderRequest): Promise<void> {
        return await this.httpClient.patch(`api/v1/timetable/location/change-order`, changeOrderRequest)
    }

    public async deleteTimetableLocation(timetableLocationId: string): Promise<void> {
        return await this.httpClient.delete(`api/v1/timetable/location/${timetableLocationId}`)
    }
}
