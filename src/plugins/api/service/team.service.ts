import type { HttpClient } from "@/plugins/api/HttpClient"
import type { Team, TeamRequest } from "@/types"

export class TeamService {
    constructor(private httpClient: HttpClient) {}

    public async listTeams(): Promise<Team[]> {
        return await this.httpClient.get<Team[]>("/api/v1/team")
    }

    public async createTeam(teamRequest: TeamRequest): Promise<Team> {
        return await this.httpClient.post<Team>("api/v1/team", teamRequest)
    }

    public async updateTeam(teamId: string, teamRequest: TeamRequest): Promise<Team> {
        return await this.httpClient.put<Team>(`/api/v1/team/${teamId}`, teamRequest)
    }
}
