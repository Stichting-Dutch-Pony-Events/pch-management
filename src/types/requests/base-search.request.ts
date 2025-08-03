import type { SortItem } from "@/types"

export interface BaseSearchRequest {
    query: string
    page: number
    itemsPerPage: number
    sortBy: SortItem[]
}
