import type { EntityView } from "./entity-view"
import type { Team } from "./team"
import { TShirtSizeEnum } from "../enum"
import type { AttendeeAchievement } from "@/types"

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
    roles: string[]
    team?: Team | null
    achievements?: AttendeeAchievement[]
}
