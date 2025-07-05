export interface MessageStoreState {
    queue: SnackBarMessage[]
}

export interface SnackBarMessage {
    text: string
    timeout: number
    color: "error" | "info" | "success" | "warning"
}
