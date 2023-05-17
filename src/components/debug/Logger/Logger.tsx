/* eslint-disable no-console */
////
///
// components › debug › Logger

import util from 'util'

export default function Logger({ data }: any) {
  console.log(util.inspect(data, false, 4, true))
  return <div />
}
