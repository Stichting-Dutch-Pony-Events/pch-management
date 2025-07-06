import type { HttpClient } from "@/plugins/api"
import type { QuizQuestion, QuizQuestionRequest } from "@/types"

export class QuizService {
    constructor(private httpClient: HttpClient) {}

    public async getList(): Promise<QuizQuestion[]> {
        return await this.httpClient.get(`api/v1/quiz/questions`)
    }

    public async getQuestion(id: string): Promise<QuizQuestion> {
        return await this.httpClient.get(`api/v1/quiz/questions/${id}`)
    }

    public async createQuizQuestion(quizQuestionRequest: QuizQuestionRequest): Promise<QuizQuestion> {
        return await this.httpClient.post(`api/v1/quiz/questions`, quizQuestionRequest)
    }
}
