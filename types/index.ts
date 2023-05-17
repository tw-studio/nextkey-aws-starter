////
///
// types › index.ts

export type BreakpointNames = 'mobile' | 'largeMobile' | 'desktop' | 'mid' | 'full'
export type BreakpointLengths = {
  [key in BreakpointNames]: number
}

export interface JSONArray extends Array<JSONObject> {}
export interface JSONObject { [key: string]: JSONValue }
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray
