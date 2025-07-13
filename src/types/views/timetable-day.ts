import type { EntityView } from "./entity-view"

export interface TimetableDay extends EntityView {
    title: string
    order: number
    startsAt: string // ISO time string
    endsAt: string // ISO time string
}
