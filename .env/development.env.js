//
// development.env.js
// Development environment variables for custom server
//
const envCommon = require('./common.env.js')
const flagsDevelopment = require('./development.flags.js')
const {
  dbDevPassword,
  jwtAud,
  jwtIss,
  jwtSubMain,
  jwtSubOne,
  rootPwd,
  secretCookie,
  secretJWT,
  secretKeyMain,
  secretKeyOne,
  useDatabase,
  useHttpsFromS3,
  useHttpsLocal,
  useNextKey,
} = require('./.secrets.js')

const dbPort = process.env.OVERRIDE_DB_PORT ?? '5432'
const port = process.env.OVERRIDE_PORT ?? '3000'

const envDevelopment = {
  ...envCommon,
  ...flagsDevelopment,
  DB_DEV_DATABASE_NAME: 'my_app_db',
  DB_DEV_HOST: 'host.docker.internal',
  DB_DEV_PASSWORD: dbDevPassword ?? '',
  DB_DEV_PORT: dbPort,
  DB_DEV_USER: 'my_app_user',
  JWT_AUD: jwtAud ?? '',
  JWT_ISS: jwtIss ?? '',
  JWT_SUB_MAIN: jwtSubMain ?? '',
  JWT_SUB_ONE: jwtSubOne ?? '',
  NEXT_PUBLIC_API_MOCKING: 'disabled',
  PORT: port,
  ROOT_PWD: rootPwd ?? '.',
  SECRET_COOKIE: secretCookie ?? '',
  SECRET_JWT: secretJWT ?? '',
  SECRET_KEY_MAIN: secretKeyMain ?? '',
  SECRET_KEY_ONE: secretKeyOne ?? '',
  TRUE_ENV: 'development',
  USE_DATABASE: useDatabase ?? '0',
  USE_HTTPS_FROM_S3: useHttpsFromS3 ?? '',
  USE_HTTPS_LOCAL: useHttpsLocal ?? '0',
  USE_NEXTKEY: useNextKey ?? '1',
}

module.exports = envDevelopment
