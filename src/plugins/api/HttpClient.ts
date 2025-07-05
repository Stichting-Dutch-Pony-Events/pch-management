import { HttpClientError } from "@/plugins/api/HttpClientError"
import { type MainStore, useMainStore } from "@/plugins/pinia/main-store"
import { AttendeeService } from "@/plugins/api/attendee.service"
import type { ErrorResponse, LoginCheckRequest, LoginResponse } from "@/types"
import type { _ActionsTree, _GettersTree, Store } from "pinia"
import { inject } from "vue"

export class HttpClient {
    public attendeeService: AttendeeService
    public store: Store<"main", MainStore, _GettersTree<MainStore>, _ActionsTree>

    public constructor(public baseUrl: string) {
        this.attendeeService = new AttendeeService(this)
        this.store = useMainStore()
    }

    public async login(loginRequest: LoginCheckRequest): Promise<LoginResponse> {
        const loginResponse: LoginResponse = await this.post<LoginResponse>("/api/login_check", loginRequest)

        this.store.authToken = loginResponse.token

        this.store.user = await this.attendeeService.getMe()

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
                Authorization: `Bearer ${this.store.authToken}`,
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
                Authorization: `Bearer ${this.store.authToken}`,
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
                this.store.authToken = null
                this.store.user = null
                throw new HttpClientError("Unauthorized", "You are not authorized to access this resource.")
            }

            if (response.status > 400 && response.status < 500) {
                const errorResponse: ErrorResponse = (await response.json()) as ErrorResponse
                throw new HttpClientError(errorResponse.code, errorResponse.message)
            }

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
