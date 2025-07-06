import type { EntityView } from "./entity-view"
import type { QuizAnswerTeamWeight } from "./quiz-answer-team-weight"

export interface QuizAnswer extends EntityView {
    answer: string
    order: number
    quizAnswerTeamWeights?: QuizAnswerTeamWeight[]
}
