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
  jwtSubMain: 'main_site',
  jwtSubOne: 'variation_one',
  rootPwd: `/home/runner/work/${ghaRepoName}/${ghaRepoName}`,
  secretCookie: '',
  secretJWT: 'secretJWT secret',
  secretKeyMain: 'main password',
  secretKeyOne: 'password for one',
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
const jwtSubMain = '${secrets.jwtSubMain}'
const jwtSubOne = '${secrets.jwtSubOne}'
const rootPwd = '${secrets.rootPwd}'
const secretCookie = '${secrets.secretCookie}'
const secretJWT = '${secrets.secretJWT}'
const secretKeyMain = '${secrets.secretKeyMain}'
const secretKeyOne = '${secrets.secretKeyOne}'
const useHttpsFromS3 = '${secrets.useHttpsFromS3}'
const useHttpsLocal = '${secrets.useHttpsLocal}'

module.exports = {
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
