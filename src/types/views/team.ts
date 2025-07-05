import type { EntityView } from "./entity-view"

export interface Team extends EntityView {
    name: string
    description: string
    identifier: string
    points: number
}
