import type { EntityView } from "./entity-view"

export interface Product extends EntityView {
    name: string
    pretixId: number
}
