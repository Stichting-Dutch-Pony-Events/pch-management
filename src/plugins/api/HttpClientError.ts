export class HttpClientError extends Error {
    public constructor(
        public code: string,
        public message: string,
    ) {
        super()
    }
}
