//
// production.env.js
//
const envCommon = require('./common.env.js')
const flagsProduction = require('./production.flags.js')
const {
  dbProdDatabaseName,
  dbProdHost,
  dbProdPassword,
  dbProdPort,
  dbProdUser,
  hostname,
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
} = require('./.production.secrets.js') // populated by deploy script

const port = process.env.OVERRIDE_PORT ?? (useHttpsFromS3 === '1' ? '443' : '80')

const envProduction = {
  ...envCommon,
  ...flagsProduction,
  DB_PROD_DATABASE_NAME: dbProdDatabaseName ?? '',
  DB_PROD_HOST: dbProdHost ?? '',
  DB_PROD_PASSWORD: dbProdPassword ?? '',
  DB_PROD_PORT: dbProdPort,
  DB_PROD_USER: dbProdUser,
  HOSTNAME: hostname ?? '',
  JWT_AUD: jwtAud ?? '',
  JWT_ISS: jwtIss ?? '',
  JWT_SUB_MAIN: jwtSubMain ?? '',
  JWT_SUB_ONE: jwtSubOne ?? '',
  NEXT_PUBLIC_API_MOCKING: 'disabled',
  PORT: port,
  ROOT_PWD: rootPwd ?? '/home/ubuntu/server/my-app',
  SECRET_COOKIE: secretCookie ?? '',
  SECRET_JWT: secretJWT ?? '',
  SECRET_KEY_MAIN: secretKeyMain ?? '',
  SECRET_KEY_ONE: secretKeyOne ?? '',
  TRUE_ENV: 'production',
  USE_DATABASE: useDatabase ?? '0',
  USE_HTTPS_FROM_S3: useHttpsFromS3 ?? '',
  USE_HTTPS_LOCAL: useHttpsLocal ?? '0',
  USE_NEXTKEY: useNextKey ?? '1',
}

module.exports = envProduction
