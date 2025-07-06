import type { QuizAnswerTeamWeightRequest } from "./quiz-answer-team-weight.request"

export interface QuizAnswerRequest {
    id: string | null
    answer: string
    order: number
    teamWeights: QuizAnswerTeamWeightRequest[]
}
