/* eslint no-console: 'off' */
//
// populate-secrets-test-gh.node.js
//
// Populates .env/.production.secrets.js and .env/.secrets.js with test values 
// for GitHub Actions.
//
const fs = require('fs')

const endent = require('endent')

const ghaRepoName = process.env.GHA_REPO_NAME ?? ''

const secrets = {
  dbDevPassword: 'postgrespassword',
  jwtAud: 'GitHubAction',
  jwtIss: 'GitHubAction',
  jwtSubGuest: 'guest',
  jwtSubMain: 'main',
  rootPwd: `/home/runner/work/${ghaRepoName}/${ghaRepoName}`,
  secretCookie: '',
  secretJWT: 'secretJWT secret',
  secretKeyGuest: 'guest password',
  secretKeyMain: 'main password',
  useHttpsFromS3: '0',
  useHttpsLocal: '0',
}

const secretsString = endent(`
//
// secrets
//
const dbDevPassword = '${secrets.dbDevPassword}'
const jwtAud = '${secrets.jwtAud}'
const jwtIss = '${secrets.jwtIss}'
const jwtSubGuest = '${secrets.jwtSubGuest}'
const jwtSubMain = '${secrets.jwtSubMain}'
const rootPwd = '${secrets.rootPwd}'
const secretCookie = '${secrets.secretCookie}'
const secretJWT = '${secrets.secretJWT}'
const secretKeyGuest = '${secrets.secretKeyGuest}'
const secretKeyMain = '${secrets.secretKeyMain}'
const useHttpsFromS3 = '${secrets.useHttpsFromS3}'
const useHttpsLocal = '${secrets.useHttpsLocal}'

module.exports = {
  dbDevPassword,
  jwtAud,
  jwtIss,
  jwtSubGuest,
  jwtSubMain,
  rootPwd,
  secretCookie,
  secretJWT,
  secretKeyGuest,
  secretKeyMain,
  useHttpsFromS3,
  useHttpsLocal,
}

`)

try {
  fs.writeFileSync('.env/.production.secrets.js', secretsString, { flag: 'wx' })
} catch (error) {
  console.error('error in populating .production.secrets.js: ', error)
}

try {
  fs.writeFileSync('.env/.secrets.js', secretsString, { flag: 'wx' })
} catch (error) {
  console.error('error in populating .secrets.js: ', error)
}
