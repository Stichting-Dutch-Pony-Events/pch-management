import type { HttpClient } from "@/plugins/api/HttpClient"
import type { Attendee } from "@/types"

export class AttendeeService {
    constructor(private httpClient: HttpClient) {}

    public async getMe(): Promise<Attendee> {
        return await this.httpClient.get<Attendee>("/api/v1/attendee/me")
    }
}
