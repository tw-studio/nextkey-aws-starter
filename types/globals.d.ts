//
// globals.d.ts
//
import util from 'util'

declare global {
  namespace NodeJS {
    interface Global {
      util: typeof util
      inspect: typeof util.inspect
    }
  }
}
