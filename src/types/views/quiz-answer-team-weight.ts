import type { EntityView } from "./entity-view"
import type { Team } from "@/types"

export interface QuizAnswerTeamWeight extends EntityView {
    team: Team
    weight: number
}
