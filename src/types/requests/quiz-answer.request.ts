import type { QuizAnswerTeamWeightRequest } from "./quiz-answer-team-weight.request"

export interface QuizAnswerRequest {
    id: string | null
    title: string
    answer: string
    teamWeights: QuizAnswerTeamWeightRequest[]
}
