////
///
// lockpage › types › index.ts

export interface HttpClient {
  post(url: string): HttpClientRequest
}

export interface HttpClientRequest {
  type(type: string): this
  send(data?: Record<string, unknown> | string): this
  then(
    onFulfill?: (response: HttpClientResponse) => void,
    onReject?: (error: Error) => void
  ): Promise<void>
  catch(onReject: (error: Error) => void): void
}

export interface HttpClientResponse {
  body: Record<string, unknown> | string
}
