//
// production-local.env.js
//
const envProduction = require('./production.env.js')
const {
  rootPwd,
  useHttpsLocal,
} = require('./.secrets.js')

const port = process.env.OVERRIDE_PORT ?? (useHttpsLocal === '1' ? '443' : '5000')

const envProductionLocal = {
  ...envProduction,
  DB_PROD_HOST: 'localhost',
  PORT: port,
  ROOT_PWD: rootPwd ?? '/home/ubuntu/server/my-app',
  TRUE_ENV: 'production-local',
  USE_HTTPS_LOCAL: useHttpsLocal ?? '0',
}

module.exports = envProductionLocal
