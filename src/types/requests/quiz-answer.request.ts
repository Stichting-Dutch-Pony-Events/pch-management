import type { QuizAnswerTeamWeightRequest } from "./"

export interface QuizAnswerRequest {
    title: string
    answer: string
    teamWeights: QuizAnswerTeamWeightRequest[]
}
