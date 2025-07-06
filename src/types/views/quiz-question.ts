import type { EntityView } from "./entity-view"
import type { QuizAnswer } from "./quiz-answer"

export interface QuizQuestion extends EntityView {
    question: string
    order: number
    answers: QuizAnswer[]
}
