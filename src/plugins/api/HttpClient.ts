import { HttpClientError } from "./HttpClientError"
import { AttendeeService, QuizService, TeamService, TimetableDayService, TimetableItemService, TimetableLocationService } from "./service/"
import type { ErrorResponse } from "@/types"
import { type MessageStore, useMessageStore } from "@/plugins/pinia/message-store"
import type { UserManager } from "oidc-client-ts"
import { useUserManager } from "@/plugins/oidc-client"

export class HttpClient {
    public messageStore: MessageStore
    public userManager: UserManager

    public attendeeService: AttendeeService
    public teamService: TeamService
    public quizService: QuizService
    public timetableDayService: TimetableDayService
    public timetableItemService: TimetableItemService
    public timetableLocationService: TimetableLocationService

    public constructor(public baseUrl: string) {
        this.messageStore = useMessageStore()
        this.userManager = useUserManager()

        this.attendeeService = new AttendeeService(this)
        this.teamService = new TeamService(this)
        this.quizService = new QuizService(this)
        this.timetableDayService = new TimetableDayService(this)
        this.timetableLocationService = new TimetableLocationService(this)
        this.timetableItemService = new TimetableItemService(this)
    }

    private async getAccessToken(): Promise<string> {
        try {
            const user = await this.userManager.getUser()
            if (user && user.access_token) {
                return user.access_token
            }
        } catch (error) {
            console.error("Failed to get access token:", error)
        }
        return ""
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
                "oidc-token": `Bearer ${await this.getAccessToken()}`,
            },
        })

        await this.handleError(response)

        return (await response.json()) as T
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async post<T>(url: string, body: any): Promise<T> {
        return this.handleMethodWithContent<T>(url, "POST", body)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async put<T>(url: string, body: any): Promise<T> {
        return this.handleMethodWithContent(url, "PUT", body)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async patch<T>(url: string, body: any): Promise<T> {
        return this.handleMethodWithContent<T>(url, "PATCH", body)
    }

    public async delete<T>(url: string): Promise<T> {
        const response: Response = await fetch(new URL(url, this.baseUrl).toString(), {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "oidc-token": `Bearer ${await this.getAccessToken()}`,
            },
        })

        await this.handleError(response)

        if (response.status === 204) {
            return {} as T // Return an empty object for 204 No Content
        }

        const json = await response.json()

        return json as T
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async handleMethodWithContent<T>(url: string, method: string, body: any): Promise<T> {
        const response: Response = await fetch(new URL(url, this.baseUrl).toString(), {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "oidc-token": `Bearer ${await this.getAccessToken()}`,
            },
            body: JSON.stringify(body),
        })

        await this.handleError(response)

        if (response.status === 204) {
            return {} as T // Return an empty object for 204 No Content
        }

        const json = await response.json()

        return json as T
    }

    private async handleError(response: Response, loginRoute: boolean = false): Promise<void> {
        if (!response.ok) {
            if (response.status === 401 && !loginRoute) {
                await this.userManager.signinSilent()

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
