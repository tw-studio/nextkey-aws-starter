/* eslint import/prefer-default-export: 'off' */
import cookieParser from 'cookie-parser'
import { decodeJwt } from 'jose'
import { NextResponse as res } from 'next/server'
import type { NextRequest } from 'next/server'

import { Strings } from '@resources/Strings'

export function middleware(req: NextRequest) {
  const activeIndex = parseInt(process.env.ACTIVE_INDEX ?? '0', 10)
  const cookieSecret = process.env.SECRET_COOKIE ?? ''
  const env = process.env.TRUE_ENV ?? process.env.NODE_ENV ?? 'development'
  const jwtName = process.env.JWT_NAME ?? 'access_token'
  const pathBases = [
    '/_main',
    '/_guest',
  ]
  const { pathname } = req.nextUrl
  const publicFileRegEx = /\.(.*)$/
  const resUrl = req.nextUrl.clone()
  const useSignedCookie = cookieSecret !== ''

  // Prevent security issues – users should not be able to directly access
  // the pages/_* folders and their respective contents
  if (
    pathname.startsWith(`${pathBases[0]}`)
    || pathname.startsWith(`${pathBases[1]}`)
  ) {
    resUrl.pathname = '/404'
    return res.rewrite(resUrl)
  }

  // Skip public files
  // eslint-disable-next-line consistent-return
  if (publicFileRegEx.test(pathname)) return

  // Short circuit jwt check in hot development and test
  if (env === 'development-hot' || env === 'test') {
    resUrl.pathname = `${pathBases[activeIndex]}${pathname}`
    return res.rewrite(resUrl)
  }

  // Rewrite url to target variation based on jwt sub
  const jwtCookie = req.cookies.get(jwtName) ?? ''
  try {
    if (!jwtCookie) {
      throw new Error('Cookie expected but not found')
    } else {
      const requestJWT = useSignedCookie
        // WARNING: signedCookie throws TypeError crypto.createHmac is not a function
        ? cookieParser.signedCookie(jwtCookie.value, cookieSecret)
        : jwtCookie.value
      if (!requestJWT) {
        throw new Error(useSignedCookie
          ? 'Unable to parse cookie value as a signed cookie'
          : 'Unable to find jwt value in cookie')
      }

      const jwtDecoded = decodeJwt(requestJWT)
      const decodedSub = jwtDecoded.sub
      switch (decodedSub) {
        case process.env.JWT_SUB_MAIN:
          resUrl.pathname = `${pathBases[0]}${pathname}`
          return res.rewrite(resUrl)
        case process.env.JWT_SUB_GUEST:
          resUrl.pathname = `${pathBases[1]}${pathname}`
          return res.rewrite(resUrl)
        default:
          throw new Error('Invalid site variation') // eslint-disable-line no-throw-literal
      }
    }
  } catch (err) {
    console.error(err) // eslint-disable-line no-console
    return new Response(
      `${Strings.msg500ServerError}`,
      {
        status: 500,
        statusText: Strings.msg500ServerError,
      },
    )
  }
}
