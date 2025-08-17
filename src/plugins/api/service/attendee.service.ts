import type { HttpClient } from "@/plugins/api/HttpClient"
import type {
    Attendee,
    AttendeeRequest,
    AttendeeSearchRequest,
    AttendeeSearchResponse,
    SetAttendeeRolesRequest,
} from "@/types"

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

    public async setAttendeeRoles(
        attendeeId: string,
        setAttendeeRolesRequest: SetAttendeeRolesRequest
    ): Promise<Attendee> {
        return await this.httpClient.put<Attendee>(`/api/v1/attendee/${attendeeId}/roles`, setAttendeeRolesRequest)
    }

    public async updateAttendee(attendeeId: string, attendeeRequest: AttendeeRequest): Promise<Attendee> {
        return await this.httpClient.put<Attendee>(`/api/v1/attendee/${attendeeId}`, attendeeRequest)
    }

    public async getAttendeeBadge(attendeeId: string, disableCache: boolean = false): Promise<Blob> {
        return await this.httpClient.downloadFile(`/api/v1/attendee/${attendeeId}/image?cache=${!disableCache}`)
    }
}
