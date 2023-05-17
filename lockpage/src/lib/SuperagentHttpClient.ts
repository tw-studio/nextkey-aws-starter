////
///
// SuperagentHttpClient.ts

import superagent from 'superagent'

import { HttpClient, HttpClientRequest } from '../types'

export default class SuperagentHttpClient implements HttpClient {
  // eslint-disable-next-line class-methods-use-this
  post(url: string): HttpClientRequest {
    return superagent.post(url)
  }
}
