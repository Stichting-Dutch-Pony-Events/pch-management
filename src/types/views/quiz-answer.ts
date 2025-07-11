import type { EntityView } from "./entity-view"
import type { QuizAnswerTeamWeight } from "./"

export interface QuizAnswer extends EntityView {
    title: string
    answer: string
    order: number
    quizAnswerTeamWeights?: QuizAnswerTeamWeight[]
}
