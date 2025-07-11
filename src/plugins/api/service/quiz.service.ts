import type { HttpClient } from "@/plugins/api"
import type { QuizAnswer, QuizQuestion, QuizQuestionRequest } from "@/types"
import type { ChangeOrderRequest } from "@/types/requests/change-order.request"

export class QuizService {
    constructor(private httpClient: HttpClient) {}

    public async getList(): Promise<QuizQuestion[]> {
        return await this.httpClient.get(`api/v1/quiz/questions`)
    }

    public async getQuestion(id: string): Promise<QuizQuestion> {
        return await this.httpClient.get(`api/v1/quiz/questions/${id}`)
    }

    public async getAnswers(questionId: string): Promise<QuizAnswer[]> {
        return await this.httpClient.get(`api/v1/quiz/questions/${questionId}/answers`)
    }

    public async createQuizQuestion(quizQuestionRequest: QuizQuestionRequest): Promise<QuizQuestion> {
        return await this.httpClient.post(`api/v1/quiz/questions`, quizQuestionRequest)
    }

    public async updateQuizQuestion(id: string, quizQuestionRequest: QuizQuestionRequest): Promise<QuizQuestion> {
        return await this.httpClient.put(`api/v1/quiz/questions/${id}`, quizQuestionRequest)
    }

    public async changeQuestionOrder(changeOrderRequest: ChangeOrderRequest): Promise<void> {
        return await this.httpClient.patch(`api/v1/quiz/questions/change-order`, changeOrderRequest)
    }
}
