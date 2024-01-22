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
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { SignJWT, decodeJwt, jwtVerify } from 'jose'
import morgan from 'morgan'
import nextStart from 'next'

import { Strings } from '../resources/Strings'
import epoch from '../utils/epoch'
import { getErrorMessage } from '../utils/errors'

const env = process.env.TRUE_ENV ?? ''
const expireInSecs = parseInt(process.env.JWT_EXP_IN_SEC ?? '604800', 10) // 1 week
const expireInMillisecs = expireInSecs * 1000
const hostname = process.env.HOSTNAME ?? ''
const isDev = !(process.env.TRUE_ENV ?? '').startsWith('production')
const isProd = process.env.TRUE_ENV === 'production'
const isProdLocal = process.env.TRUE_ENV === 'production-local'
const jwtAlg = process.env.JWT_ALG ?? ''
const jwtAud = process.env.JWT_AUD ?? ''
const jwtIss = process.env.JWT_ISS ?? ''
const jwtSubMain = process.env.JWT_SUB_MAIN ?? ''
const jwtSubOne = process.env.JWT_SUB_ONE ?? ''
const keyName = process.env.KEY_NAME ?? ''
const limiterGeneral = rateLimit({
  max: 300, // limit each IP to 300 general requests per windowMs
  message: "You've made too many requests in a short period. Please wait an hour before trying again.",
  windowMs: 60 * 60 * 1000, // 1 hour
})
const limiterUnlock = rateLimit({
  max: 10, // limit each IP to 10 unlock requests per windowMs
  message: "You've made too many login attempts in a short period. Please wait an hour before trying again.",
  windowMs: 60 * 60 * 1000, // 1 hour
})
const loginPath = process.env.NEXT_PUBLIC_LOGIN_PATH ?? ''
const lockpageExportDir = path.resolve(__dirname, `../${process.env.LOCKPAGE_EXPORT_DIR}`)
const lockpagePublicDir = path.resolve(__dirname, `../${process.env.LOCKPAGE_PUBLIC_DIR}`)
const port = parseInt(process.env.PORT ?? '3000', 10)
const secretCookie = process.env.SECRET_COOKIE ?? ''
const secretJwt = Buffer.from(process.env.SECRET_JWT ?? '', 'base64url')
const secretKeyMain = process.env.SECRET_KEY_MAIN ?? ''
const secretKeyOne = process.env.SECRET_KEY_ONE ?? ''
const useHttpsFromS3 = process.env.USE_HTTPS_FROM_S3 === '1'
const useHttpsLocal = process.env.USE_HTTPS_LOCAL === '1'
const useNextKey = process.env.USE_NEXTKEY === '1'
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
    
    // Redirect HTTP to HTTPS in production
    if ((isProd && useHttpsFromS3) || (isProdLocal && useHttpsLocal)) {
      app.use(redirectHTTP)
    }

    // Configure secure headers with helmet
    if (isProd && useHttpsFromS3) {
      app.use(setHelmet())
    } else if (isProd && !useHttpsFromS3) {
      app.use(setHelmet('prod-http')) // removes `https:` from CSP
    } else if ((isDev || isProdLocal) && useHttpsLocal) {
      app.use(setHelmet('local')) // allows 'unsafe-eval' in script-src
    }

    // Logging
    if (isDev) {
      app.use(morgan('dev'))
    } else {
      app.use(morgan(':method :url :status :response-time ms - :res[content-length] :referrer ":remote-addr - :remote-user" ":user-agent"'))
    }

    // Enable reading form data
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    // Enable signed cookies
    app.use(cookieParser(secretCookie))

    // Apply general rate limiter
    app.use(limiterGeneral)

    // Serve only the locksite before authentication and set with virtual path prefix
    app.use(loginPath, express.static(lockpageExportDir))

    // Authenticate with keyphrase (and strictly rate limit unlock requests)
    app.post('/unlock', limiterUnlock, asyncHandler(unlockWithKey))

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
          console.log(`Node ${env} server (https): listening on port ${port}`)
        })
        .on('error', (err: unknown) => {
          throw new Error(getErrorMessage(err))
        })
      
      // Redirect HTTP to HTTPS in production
      app
        .listen(80, () => {
          // eslint-disable-next-line no-console
          console.log(`Node ${env} redirect server (http): listening on port 80`)
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
          console.log(`Node ${env} server (https): listening on port ${port}`)
        })
        .on('error', (err: unknown) => {
          throw new Error(getErrorMessage(err))
        })
      
      // Redirect HTTP to HTTPS in prod-local only
      if (isProdLocal) {
        app
          .listen(80, () => {
            // eslint-disable-next-line no-console
            console.log(`Node ${env} redirect server (http): listening on port 80`)
          })
          .on('error', (err: unknown) => {
            throw new Error(getErrorMessage(err))
          })
      }
    } else {
      app
        .listen(port, () => {
          // eslint-disable-next-line no-console
          console.log(`Node ${env} server (http): listening on port ${port}`)
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
          defaultSrc: [`'none'`],
          fontSrc: [`'self'`, `https:`, `data:`],
          formAction: [`'self'`],
          frameAncestors: [`'none'`],
          frameSrc: [`'none'`],
          imgSrc: [`'self'`, `data:`],
          mediaSrc: [`'none'`],
          objectSrc: [`'none'`],
          sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin', 'allow-popups'],
          scriptSrc: [`'self'`, `'unsafe-eval'`], // unsafe-eval in local only
          scriptSrcAttr: [`'none'`],
          styleSrc: [`'self'`, `https:`, `'unsafe-inline'`], // unsafe-inline for Stitches
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: true,
      referrerPolicy: {
        policy: ['no-referrer', 'strict-origin-when-cross-origin'],
      },
    })
  }
  
  // Production headers without `https:`
  if (type === 'prod-http') {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          baseUri: [`'self'`],
          blockAllMixedContent: [],
          connectSrc: [`'self'`],
          defaultSrc: [`'none'`],
          fontSrc: [`'self'`, `data:`],
          formAction: [`'self'`],
          frameAncestors: [`'none'`],
          frameSrc: [`'none'`],
          imgSrc: [`'self'`, `data:`],
          mediaSrc: [`'none'`],
          objectSrc: [`'none'`],
          sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin', 'allow-popups'],
          scriptSrc: [`'self'`],
          scriptSrcAttr: [`'none'`],
          styleSrc: [`'self'`, `'unsafe-inline'`], // unsafe-inline for Stitches
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: true,
      referrerPolicy: {
        policy: ['no-referrer', 'strict-origin-when-cross-origin'],
      },
    })
  }
  
  // Production headers (assumes https)
  return helmet({
    contentSecurityPolicy: {
      directives: {
        baseUri: [`'self'`],
        blockAllMixedContent: [],
        connectSrc: [`'self'`],
        defaultSrc: [`'none'`],
        fontSrc: [`'self'`, `https:`, `data:`],
        formAction: [`'self'`],
        frameAncestors: [`'none'`],
        frameSrc: [`'none'`],
        imgSrc: [`'self'`, `data:`],
        mediaSrc: [`'none'`],
        objectSrc: [`'none'`],
        sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin', 'allow-popups'],
        scriptSrc: [`'self'`],
        scriptSrcAttr: [`'none'`],
        styleSrc: [`'self'`, `https:`, `'unsafe-inline'`], // unsafe-inline for Stitches
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: true,
    referrerPolicy: {
      policy: ['no-referrer', 'strict-origin-when-cross-origin'],
    },
  })
}

// eslint-disable-next-line consistent-return
function redirectHTTP(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
  if (req.protocol === 'http') {
    return res.redirect(`https://${req.headers.host}${req.url}`)
  }
  next()
}

function bearsKey(req: ExpressRequest) {
  if (
    !(
      process.env.KEY_NAME
      && process.env.SECRET_KEY_MAIN
      && process.env.SECRET_KEY_ONE
    )
  ) {
    return false
  }
  return (
    req.body[process.env.KEY_NAME] === process.env.SECRET_KEY_MAIN
    || req.body[process.env.KEY_NAME] === process.env.SECRET_KEY_ONE
  )
}

async function unlockWithKey(req: ExpressRequest, res: ExpressResponse) {
  if (
    !(
      process.env.KEY_NAME
      && process.env.SECRET_KEY_MAIN
      && process.env.SECRET_KEY_ONE
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
      case secretKeyOne:
        jwtSub = jwtSubOne
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
      && process.env.JWT_SUB_ONE
      && process.env.NEXT_PUBLIC_LOGIN_PATH
      && process.env.SECRET_JWT
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
        if (useNextKey) {
          // when nextkey enabled and no cookie:
          // first, handle special exceptions
          if (req.path === '/robots.txt') {
            const lockpageRobotsTxtPath = `${lockpagePublicDir}/robots.txt`
            if (fs.existsSync(lockpageRobotsTxtPath)) {
              const robotsTxt = fs.readFileSync(lockpageRobotsTxtPath)
              res.type('text/plain')
              res.send(robotsTxt)
            } else {
              res.type('text/plain')
              res.send('User-agent: *\nDisallow: /')
            }
          } else {
            // otherwise, silently redirect to nextkey
            res.redirect(303, process.env.NEXT_PUBLIC_LOGIN_PATH)
          }
        } else {
          // when not using NextKey, continue handling request
          next()
        }
      } else {
        const jwtDecoded = decodeJwt(requestJWT)
        const decodedSub = jwtDecoded.sub
        if (
          !(
            decodedSub === process.env.JWT_SUB_MAIN
            || decodedSub === process.env.JWT_SUB_ONE
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
