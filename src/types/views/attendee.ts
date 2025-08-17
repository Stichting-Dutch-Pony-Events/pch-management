import type { EntityView } from "./entity-view"
import type { Team } from "./team"
import { RoleEnum, TShirtSizeEnum } from "../enum"
import type { AttendeeAchievement, Product } from "../"

export interface Attendee extends EntityView {
    name: string
    firstName: string | null
    middleName?: string | null
    familyName?: string | null
    nickName: string | null
    email?: string | null
    orderCode?: string
    ticketId?: number
    nfcTagId?: string | null
    miniIdentifier?: string | null
    tShirtSize?: TShirtSizeEnum | null
    fireBaseToken?: string | null
    userRoles: RoleEnum[]
    team?: Team | null
    achievements?: AttendeeAchievement[]
    product: Product | null
    overrideBadgeProduct: Product | null
}
