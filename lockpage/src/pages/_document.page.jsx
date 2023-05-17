/* eslint-disable react/no-danger */
//
// _document.page.jsx (lockpage)
//
import React from 'react'

import NextDocument, { Html, Head, Main, NextScript } from 'next/document'

import { getCssText } from '../../../stitches.config'

const basePath = process.env.NEXT_PUBLIC_LOGIN_PATH ?? '/'

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en">
        <Head>
          <style id="stitches" dangerouslySetInnerHTML={{ __html: getCssText() }} />
          <link rel="apple-touch-icon" href={`${basePath}apple-touch-icon.png`} />
          <link rel="icon" href={`${basePath}favicon.ico`} sizes="any" />
          <link rel="icon" href={`${basePath}icon.svg`} type="image/svg+xml" />
          <link rel="manifest" href={`${basePath}manifest.webmanifest`} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
