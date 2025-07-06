import type { QuizAnswerRequest } from "./quiz-answer.request"

export interface QuizQuestionRequest {
    question: string
    answers: QuizAnswerRequest[]
}
