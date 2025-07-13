import type { HttpClient } from "@/plugins/api"
import type { TimetableDay } from "@/types"
import type { TimetableDayRequest } from "@/types/requests/timetable-day.request"
import type { ChangeOrderRequest } from "@/types/requests/change-order.request"

export class TimetableDayService {
    constructor(private httpClient: HttpClient) {}

    public async getTimetableDays(): Promise<TimetableDay[]> {
        return await this.httpClient.get<TimetableDay[]>("/api/v1/timetable/days")
    }

    public async createTimetableDay(timetableDayRequest: TimetableDayRequest): Promise<TimetableDay> {
        return await this.httpClient.post<TimetableDay>("/api/v1/timetable/days", timetableDayRequest)
    }

    public async updateTimetableDay(timetableDayId: number, timetableDayRequest: TimetableDayRequest): Promise<TimetableDay> {
        return await this.httpClient.put<TimetableDay>(`/api/v1/timetable/days/${timetableDayId}`, timetableDayRequest)
    }

    public async changeTimetableDayOrder(changeOrderRequest: ChangeOrderRequest): Promise<void> {
        return await this.httpClient.patch(`api/v1/timetable/days/change-order`, changeOrderRequest)
    }

    public async deleteTimetableDay(id: string): Promise<void> {
        return await this.httpClient.delete(`api/v1/timetable/days/${id}`)
    }
}
