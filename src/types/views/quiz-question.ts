import type { EntityView } from "./entity-view"

export interface QuizQuestion extends EntityView {
    question: string
    order: number
}
