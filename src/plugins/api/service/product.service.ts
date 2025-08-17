import type { HttpClient } from "@/plugins/api"
import type { Product } from "@/types"

export class ProductService {
    constructor(private httpClient: HttpClient) {}

    public async listProducts(): Promise<Product[]> {
        return await this.httpClient.get<Product[]>("/api/v1/products")
    }
}
