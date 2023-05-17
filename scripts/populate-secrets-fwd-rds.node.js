/* eslint no-console: 'off' */
//
// populate-secrets-fwd-rds.node.js
//
const fs = require('fs')
const path = require('path')

const { SSMClient, GetParametersCommand } = require('@aws-sdk/client-ssm')
const endent = require('endent')

const region = process.env.REGION
const ssmPath = process.env.SSM_PATH

// |1| Initialize the object to hold secrets as they're retrieved

const secrets = {
  dbProdDatabaseName: '',
  dbProdPassword: '',
  dbProdPort: '',
  dbProdUser: '',
}

// |2| Get parameters from SSM in production (in batches of 10...)

console.log('Initializing new SSM client object...')
const ssm = new SSMClient({ region })

const getSecretsCommand = new GetParametersCommand({
  Names: [
    // batch 10 max
    `${ssmPath}dbProdDatabaseName`,
    `${ssmPath}dbProdPassword`,
    `${ssmPath}dbProdPort`,
    `${ssmPath}dbProdUser`,
  ],
  WithDecryption: true,
})

console.log('Requesting parameters batch from SSM...')
ssm
  .send(getSecretsCommand)
  .then((data) => {

    // |3| Store first batch in the secrets object

    if (data?.Parameters) {
      data.Parameters.forEach((parameter) => {
        const key = path.basename(parameter.Name)
        secrets[key] = parameter.Value
      })
    }

    // |4| Create .production.secrets file

    const secretsString = endent(`
      //
      // .production.secrets.js
      //
      const dbProdDatabaseName = '${secrets.dbProdDatabaseName}'
      const dbProdHost = ''
      const dbProdPassword = '${secrets.dbProdPassword}'
      const dbProdPort = '${secrets.dbProdPort}'
      const dbProdUser = '${secrets.dbProdUser}'
      const hostname = ''
      const jwtAud = ''
      const jwtIss = ''
      const jwtSubGuest = ''
      const jwtSubMain = ''
      const rootPwd = ''
      const secretCookie = ''
      const secretJWT = ''
      const secretKeyGuest = ''
      const secretKeyMain = ''
      const useDatabase = ''
      const useHttpsFromS3 = ''
      const useHttpsLocal = ''

      module.exports = {
        dbProdDatabaseName,
        dbProdHost,
        dbProdPassword,
        dbProdPort,
        dbProdUser,
        hostname,
        jwtAud,
        jwtIss,
        jwtSubGuest,
        jwtSubMain,
        rootPwd,
        secretCookie,
        secretJWT,
        secretKeyGuest,
        secretKeyMain,
        useDatabase,
        useHttpsFromS3,
        useHttpsLocal,
      }
    `)

    console.log('Writing parameters to secrets file...')
    fs.writeFile('.env/.production.secrets.js', secretsString, (err) => {
      try {
        if (err) throw err
      } catch (error) {
        console.error('› Unable to write secrets file: ', error)
      }
    })
  })
  .catch((err) => {
    console.error(`Unexpected error: ${err}`)
  })
