////
///
// server › index.ts

import fs from 'fs'
import https from 'https'
import path from 'path'

import cookieParser from 'cookie-parser'
import express, {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction as ExpressNextFunction,
} from 'express'
import asyncHandler from 'express-async-handler'
import helmet from 'helmet'
import { SignJWT, decodeJwt, jwtVerify } from 'jose'
import morgan from 'morgan'
import nextStart from 'next'

import { Strings } from '../resources/Strings'
import epoch from '../utils/epoch'
import { getErrorMessage } from '../utils/errors'

const expireInSecs = parseInt(process.env.JWT_EXP_IN_SEC ?? '604800', 10) // 1 week
const expireInMillisecs = expireInSecs * 1000
const hostname = process.env.HOSTNAME ?? ''
const isDev = !(process.env.TRUE_ENV ?? '').startsWith('production')
const isProd = process.env.TRUE_ENV === 'production'
const isProdLocal = process.env.TRUE_ENV === 'production-local'
const jwtAlg = process.env.JWT_ALG ?? ''
const jwtAud = process.env.JWT_AUD ?? ''
const jwtIss = process.env.JWT_ISS ?? ''
const jwtSubGuest = process.env.JWT_SUB_GUEST ?? ''
const jwtSubMain = process.env.JWT_SUB_MAIN ?? ''
const keyName = process.env.KEY_NAME ?? ''
const loginPath = process.env.NEXT_PUBLIC_LOGIN_PATH ?? ''
const lockpageStaticDir = path.resolve(__dirname, `../${process.env.LOCKPAGE_DIR}`)
const port = parseInt(process.env.PORT ?? '3000', 10)
const secretCookie = process.env.SECRET_COOKIE ?? ''
const secretJwt = Buffer.from(process.env.SECRET_JWT ?? '', 'base64url')
const secretKeyGuest = process.env.SECRET_KEY_GUEST ?? ''
const secretKeyMain = process.env.SECRET_KEY_MAIN ?? ''
const useHttpsFromS3 = process.env.USE_HTTPS_FROM_S3 === '1'
const useHttpsLocal = process.env.USE_HTTPS_LOCAL === '1'
const useSignedCookie = false // ISSUE: reading signed cookie in middleware not currently supported
// const isPRTest = process.env.TRUE_ENV === 'test-PR'

const nextApp = nextStart({
  dev: isDev,
  customServer: true,
  hostname,
  port,
})
const handle = nextApp.getRequestHandler()

////
///
// Configure and start the custom server

nextApp
  .prepare()
  .then(() => {

    const app = express()

    // Configure secure headers with helmet when using https
    if (isProd && useHttpsFromS3) {
      app.use(setHelmet())
    } else if ((isDev || isProdLocal) && useHttpsLocal) {
      app.use(setHelmet('local')) // allows 'unsafe-eval' in script-src
    }

    // Logging
    if (isDev) {
      app.use(morgan('dev'))
    } else {
      app.use(morgan(':method :url :status :response-time ms - :res[content-length] :referrer ":remote-addr - :remote-user" ":user-agent"'))
    }

    // Enforce HTTPS in production (done differently in dev)
    // trustProtoHeader needed for load balancer (not working)
    // if (!isDev) {
    //   app.use(enforce.HTTPS({ trustProtoHeader: true }))
    // }

    // Enable reading form data
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    // Enable signed cookies
    app.use(cookieParser(secretCookie))

    // Serve only the locksite before authentication and set with virtual path prefix
    app.use(
      loginPath,
      express.static(lockpageStaticDir),
    )

    // Authenticate with keyphrase
    app.post('/unlock', asyncHandler(unlockWithKey))

    // Ensure authenticated before serving the main site
    app.use(asyncHandler(authenticateJWT))

    // Authenticated; now pass to Next handler
    app.get('*', (req: ExpressRequest, res: ExpressResponse) => handle(req, res))

    if (isProd && useHttpsFromS3) {
      https
        .createServer(
          {
            cert: fs.readFileSync('../.certificates/fullchain.pem'),
            key: fs.readFileSync('../.certificates/privkey.pem'),
          },
          app,
        )
        .listen(port, () => {
          // eslint-disable-next-line no-console
          console.log(`Node prod server (https): listening on port ${port}`)
        })
        .on('error', (err: unknown) => {
          throw new Error(getErrorMessage(err))
        })
    } else if ((isDev || isProdLocal) && useHttpsLocal) {
      // Use localhost https when set in development and test
      https
        .createServer(
          {
            // Run pnpm gencerts to generate local-only https certs
            key: fs.readFileSync('./server/.localcerts/localhost.key'),
            cert: fs.readFileSync('./server/.localcerts/localhost.crt'),
          },
          app,
        )
        .listen(port, () => {
          // eslint-disable-next-line no-console
          console.log(`Node dev server (https): listening on port ${port}`)
        })
        .on('error', (err: unknown) => {
          throw new Error(getErrorMessage(err))
        })
    } else {
      app
        .listen(port, () => {
          // eslint-disable-next-line no-console
          console.log(
            `Node ${
              // eslint-disable-next-line
              isDev ? 'dev server' : 'process ' + process.pid
            }: listening on port ${port}`,
          )
        })
        .on('error', (err: unknown) => {
          throw new Error(getErrorMessage(err))
        })
    }
  })
  .catch((err: unknown) => {
    console.error(getErrorMessage(err)) // eslint-disable-line no-console
  })

////
///
// Functions

function setHelmet(type?: string) {
  
  // Allow 'unsafe-eval' in script-src for local development
  if (type === 'local') {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          baseUri: [`'self'`],
          blockAllMixedContent: [],
          connectSrc: [`'self'`],
          defaultSrc: [`'self'`],
          fontSrc: [`'self'`, `data:`],
          formAction: [`'self'`],
          frameAncestors: [`'none'`],
          frameSrc: [`'none'`],
          imgSrc: [`'self'`, `data:`, `https://images.pexels.com`],
          mediaSrc: [`'none'`],
          objectSrc: [`'none'`],
          sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin'],
          scriptSrc: [`'self'`, `'unsafe-eval'`],
          scriptSrcAttr: [`'none'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: true,
      referrerPolicy: {
        policy: ['no-referrer', 'strict-origin-when-cross-origin'],
      },
    })
  }
  
  // Production headers
  return helmet({
    contentSecurityPolicy: {
      directives: {
        baseUri: [`'self'`],
        blockAllMixedContent: [],
        connectSrc: [`'self'`],
        defaultSrc: [`'self'`],
        fontSrc: [`'self'`, `data:`],
        formAction: [`'self'`],
        frameAncestors: [`'none'`],
        frameSrc: [`'none'`],
        imgSrc: [`'self'`, `data:`, `https://images.pexels.com`],
        mediaSrc: [`'none'`],
        objectSrc: [`'none'`],
        sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin'],
        scriptSrc: [`'self'`],
        scriptSrcAttr: [`'none'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: true,
    referrerPolicy: {
      policy: ['no-referrer', 'strict-origin-when-cross-origin'],
    },
  })
}

function bearsKey(req: ExpressRequest) {
  if (
    !(
      process.env.KEY_NAME
      && process.env.SECRET_KEY_MAIN
      && process.env.SECRET_KEY_GUEST
    )
  ) {
    return false
  }
  return (
    req.body[process.env.KEY_NAME] === process.env.SECRET_KEY_MAIN
    || req.body[process.env.KEY_NAME] === process.env.SECRET_KEY_GUEST
  )
}

async function unlockWithKey(req: ExpressRequest, res: ExpressResponse) {
  if (
    !(
      process.env.KEY_NAME
      && process.env.SECRET_KEY_MAIN
      && process.env.SECRET_KEY_GUEST
      && process.env.JWT_ALG
      && process.env.JWT_AUD
      && process.env.JWT_ISS
      && process.env.JWT_NAME
    )
  ) {
    console.error('Server environment variables not set') // eslint-disable-line no-console
    res.status(500).send(Strings.msg500ServerError)
  }
  if (bearsKey(req)) {
    let jwtSub = ''
    // env vars exist checked by bearsKey
    switch (req.body[keyName]) {
      case secretKeyMain:
        jwtSub = jwtSubMain
        break
      case secretKeyGuest:
        jwtSub = jwtSubGuest
        break
      default:
        console.error('Key not recognized') // eslint-disable-line no-console
        res.status(500).send(Strings.msg500ServerError)
    }
    try {
      // 
      const expirationTime = epoch(new Date()) + expireInSecs
      const signedJWT = await new SignJWT({})
        .setAudience(jwtAud)
        .setExpirationTime(expirationTime)
        .setIssuedAt()
        .setIssuer(jwtIss)
        .setProtectedHeader({ alg: jwtAlg })
        .setSubject(jwtSub)
        .sign(secretJwt)
      if (!signedJWT) {
        console.error('JWT signing failed') // eslint-disable-line no-console
        res.status(500).send(Strings.msg500ServerError)
      } else {
        res.cookie(process.env.JWT_NAME as string, signedJWT, {
          httpOnly: true,
          maxAge: expireInMillisecs,
          sameSite: 'strict',
          secure: ((isProd && useHttpsFromS3) || ((isDev || isProdLocal) && useHttpsLocal)),
          signed: useSignedCookie,
        })
        // redirect to '../' since lockpage is served at login path
        res.status(200).json({ redirect: '../' })
      }
    } catch (err) {
      console.error(`Unexpected error while signing JWT and cookie: ${getErrorMessage(err)}`) // eslint-disable-line no-console
      res.status(500).send(Strings.msg500ServerError)
    }
  } else {
    res.status(401).send(Strings.msg401WrongKey)
  }
}

async function authenticateJWT(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
  // Confirm correct server environment variables
  if (
    !(
      process.env.JWT_ALG
      && process.env.JWT_AUD
      && process.env.JWT_EXP_IN_SEC
      && process.env.JWT_ISS
      && process.env.JWT_NAME
      && process.env.JWT_SUB_MAIN
      && process.env.JWT_SUB_GUEST
      && process.env.SECRET_JWT
      && process.env.NEXT_PUBLIC_LOGIN_PATH
    )
  ) {
    console.error('Server environment variables not set') // eslint-disable-line no-console
    res.status(500).send(Strings.msg500ServerError)

  // Verify jwt is expected
  } else {
    const requestJWT = useSignedCookie
      ? ((req.signedCookies && req.signedCookies[process.env.JWT_NAME]) ?? '')
      : ((req.cookies && req.cookies[process.env.JWT_NAME]) ?? '')
    try {
      if (requestJWT === '') {
        // no cookie, silently redirect
        res.redirect(303, process.env.NEXT_PUBLIC_LOGIN_PATH)
      } else {
        const jwtDecoded = decodeJwt(requestJWT)
        const decodedSub = jwtDecoded.sub
        if (
          !(
            decodedSub === process.env.JWT_SUB_MAIN
            || decodedSub === process.env.JWT_SUB_GUEST
          )
        ) {
          throw new Error(`Invalid jwt sub: ${decodedSub}`)
        }
        
        // throws error if invalid
        await jwtVerify(requestJWT, secretJwt, {
          algorithms: [process.env.JWT_ALG],
          audience: process.env.JWT_AUD,
          issuer: process.env.JWT_ISS,
          maxTokenAge: expireInSecs,
          subject: decodedSub,
        })

        next()
      }
    } catch (err) {
      console.error(`Unexpected error while verifying JWT: ${getErrorMessage(err)}`) // eslint-disable-line no-console
      res.redirect(303, process.env.NEXT_PUBLIC_LOGIN_PATH)
    }
  }
}
