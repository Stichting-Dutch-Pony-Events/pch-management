export interface AttendeeRequest {
    name: string
    firstName: string
    middleName: string | null
    familyName: string
    nickName: string | null
    email: string | null
    orderCode: string
    ticketId: number
    nfcTagId: string | null
    productId: string | null
    miniIdentifier: string | null
    fireBaseToken: string | null
    overrideBadgeProductId: string | null
}
