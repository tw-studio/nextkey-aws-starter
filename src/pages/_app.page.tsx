////
///
// _app.page.tsx

import React from 'react'

import type { AppProps } from 'next/app'

import { globalCss } from '@/stitches.config'
import { normalize } from '@src/styles/normalize-stitches'

// start Mock Service Worker on-demand to mock api
if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
  require('../../config/__mocks__')
}

const customGlobalStyles = {
  'body, input, textarea, button': {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,'
                + 'Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  },
  body: {
    fontSize: '100%',
    overflow: 'scroll',
    // NOTE: antialiasing ignored by Chrome when media query set
    // '@media screen and (-webkit-min-device-pixel-ratio: 2), screen and (min-resolution: 2dppx)': {
    '-moz-osx-font-smoothing': 'grayscale',
    '-webkit-font-smoothing': 'antialiased',
    'font-smoothing': 'antialiased',
    // },
  },
  '@font-face': [
    {
      fontFamily: 'PixL',
      src: `url("/pixl.regular.woff2")`,
    },
  ],
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore 
const globalStyles = globalCss(...normalize, customGlobalStyles)

export default function App({ Component, pageProps }: AppProps) {
  globalStyles()
  return <Component {...pageProps} />
}
