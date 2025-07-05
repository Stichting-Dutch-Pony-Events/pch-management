import { HttpClientError } from "./HttpClientError"
import { type MainStore, useMainStore } from "@/plugins/pinia/main-store"
import { AttendeeService } from "./attendee.service"
import type { ErrorResponse, LoginCheckRequest, LoginResponse } from "@/types"
import { inject } from "vue"
import { TeamService } from "./team.service"
import { type MessageStore, useMessageStore } from "@/plugins/pinia/message-store"

export class HttpClient {
    public attendeeService: AttendeeService
    public teamService: TeamService
    public mainStore: MainStore
    public messageStore: MessageStore

    public constructor(public baseUrl: string) {
        this.attendeeService = new AttendeeService(this)
        this.teamService = new TeamService(this)
        this.mainStore = useMainStore()
        this.messageStore = useMessageStore()
    }

    public async login(loginRequest: LoginCheckRequest): Promise<LoginResponse> {
        const loginResponse: LoginResponse = await this.post<LoginResponse>("/api/login_check", loginRequest)

        this.mainStore.authToken = loginResponse.token

        this.mainStore.user = await this.attendeeService.getMe()

        return loginResponse
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async get<T>(url: string, params?: Record<string, any>): Promise<T> {
        const fullUrl = new URL(url, this.baseUrl)
        if (params) {
            Object.keys(params).forEach((key) => fullUrl.searchParams.append(key, params[key]))
        }

        const response: Response = await fetch(fullUrl.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.mainStore.authToken}`,
            },
        })

        await this.handleError(response)

        return (await response.json()) as T
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async post<T>(url: string, body: any): Promise<T> {
        const response: Response = await fetch(new URL(url, this.baseUrl).toString(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.mainStore.authToken}`,
            },
            body: JSON.stringify(body),
        })

        await this.handleError(response)

        const json = await response.json()

        console.log(json)

        return json as T
    }

    private async handleError(response: Response): Promise<void> {
        if (!response.ok) {
            if (response.status === 401) {
                // Unauthorized, clear the auth token
                this.mainStore.authToken = null
                this.mainStore.user = null
                throw new HttpClientError("Unauthorized", "You are not authorized to access this resource.")
            }

            if (response.status > 400 && response.status < 500) {
                const errorResponse: ErrorResponse = (await response.json()) as ErrorResponse

                this.messageStore.addMessage({
                    color: "error",
                    text: errorResponse.message,
                    timeout: 5000,
                })

                throw new HttpClientError(errorResponse.code, errorResponse.message)
            }

            this.messageStore.addMessage({
                color: "error",
                text: `HTTP error! status: ${response.status}`,
                timeout: 5000,
            })
            throw new Error(`HTTP error! status: ${response.status}`)
        }
    }
}

export const useHttpClient = (): HttpClient => {
    const api: HttpClient | undefined = inject<HttpClient>("api")

    if (api === undefined) {
        throw new Error("HttpClient is not provided. Make sure to use the createPchApi plugin.")
    }

    return api
}
