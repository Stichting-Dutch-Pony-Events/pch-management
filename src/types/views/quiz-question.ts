import type { EntityView } from "./entity-view"

export interface QuizQuestion extends EntityView {
    title: string
    question: string
    order: number
}
