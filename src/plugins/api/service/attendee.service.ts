import type { HttpClient } from "@/plugins/api/HttpClient"
import type { Attendee, AttendeeSearchRequest, AttendeeSearchResponse } from "@/types"

export class AttendeeService {
    constructor(private httpClient: HttpClient) {}

    public async getMe(): Promise<Attendee> {
        return await this.httpClient.get<Attendee>("/api/v1/attendee/me")
    }

    public async getByIdentifier(identifier: string): Promise<Attendee> {
        return await this.httpClient.get<Attendee>(`/api/v1/attendee/${identifier}`)
    }

    public async searchAttendees(searchRequest: AttendeeSearchRequest): Promise<AttendeeSearchResponse> {
        return await this.httpClient.get("api/v1/attendee", this.httpClient.searchRequestToQueryParams(searchRequest))
    }
}
