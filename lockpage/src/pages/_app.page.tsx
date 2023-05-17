////
///
// _app.page.tsx (lockpage)

import type { AppProps } from 'next/app'

import { globalCss } from '../../../stitches.config'
import { normalize } from '../styles/normalize-stitches'

// start Mock Service Worker when flagged to mock api
if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
  require('../../../config/__mocks__')
}

const basePath = process.env.NEXT_PUBLIC_LOGIN_PATH ?? '/'
const customGlobalStyles = {
  body: {
    overflow: 'hidden',
  },
  '@font-face': [
    {
      fontFamily: 'PixL',
      src: `url("${basePath}pixl.regular.woff2")`,
    },
  ],
}
// @ts-ignore
const globalStyles = globalCss(...normalize, customGlobalStyles)

function App({ Component, pageProps }: AppProps) {
  globalStyles()
  return <Component {...pageProps} />
}

export default App
