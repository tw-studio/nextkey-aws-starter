/* eslint no-console: 'off' */
/* eslint-disable indent */
//
// populate-secrets-prod.node.js
//
const fs = require('fs')
const path = require('path')

const { SSMClient, GetParametersCommand } = require('@aws-sdk/client-ssm')
const endent = require('endent')

const region = process.env.REGION
const rootPwd = process.env.OVERRIDE_ROOT_PWD ?? '/home/ubuntu/server/my-app'
const ssmPath = process.env.SSM_PATH

// |1| Initialize object to hold secrets as they're retrieved

const secrets = {
  dbProdDatabaseName: '',
  dbProdHost: '',
  dbProdPassword: '',
  dbProdPort: '',
  dbProdUser: '',
  hostname: '',
  jwtAud: '',
  jwtIss: '',
  jwtSubGuest: '',
  jwtSubMain: '',
  rootPwd,
  secretCookie: '',
  secretJWT: '',
  secretKeyGuest: '',
  secretKeyMain: '',
  useDatabase: '',
  useHttpsFromS3: '',
}

// |2| Get parameters from SSM in production (in batches of 10...)

console.log('Initializing new SSM client object...')
const ssm = new SSMClient({ region })

const getSecretsCommand = new GetParametersCommand({
  Names: [
    // batch 10 max
    `${ssmPath}hostname`,
    `${ssmPath}jwtAud`,
    `${ssmPath}jwtIss`,
    `${ssmPath}jwtSubGuest`,
    `${ssmPath}jwtSubMain`,
    `${ssmPath}secretCookie`,
    `${ssmPath}secretJWT`,
    `${ssmPath}secretKeyGuest`,
    `${ssmPath}secretKeyMain`,
  ],
  WithDecryption: true,
})

console.log('Requesting parameters batch from SSM...')
ssm
  .send(getSecretsCommand)
  .then((data) => {

    // |3| Store first batch in the secrets object

    if (data?.Parameters) {
      console.log('  parameters found')
      data.Parameters.forEach((parameter) => {
        const key = path.basename(parameter.Name)
        secrets[key] = parameter.Value
      })
    } else {
      console.log('› parameters not found')
    }
    
    // |4| Pull USE_HTTPS_FROM_S3 from vars file if exists

    const pathUseHttpsFromS3 = path.resolve(secrets.rootPwd, '../../vars/USE_HTTPS_FROM_S3')

    console.log('Checking locally for ../../vars/USE_HTTPS_FROM_S3...')
    try {
      fs.accessSync(pathUseHttpsFromS3, fs.f_OK) // throws error or returns undefined
      const readData = fs.readFileSync(pathUseHttpsFromS3, 'utf8')
      if (readData) {
        const trimmedData = readData.trimEnd() // remove trailing whitespace
        secrets.useHttpsFromS3 = trimmedData
      }
    } catch (err) {
      console.error('› ../../vars/USE_HTTPS_FROM_S3 not found. Continuing...')
    }

    // |5| Get second batch of parameters from SSM
    
    const getSecretsCommand2 = new GetParametersCommand({
      Names: [
        // batch 10 max
        `${ssmPath}dbProdDatabaseName`,
        `${ssmPath}dbProdPassword`,
        `${ssmPath}dbProdPort`,
        `${ssmPath}dbProdUser`,
        `${ssmPath}useDatabase`,
      ],
      WithDecryption: true,
    })
 
    console.log('Requesting parameters batch from SSM...')
    return ssm.send(getSecretsCommand2)
  })
  .then((data) => {
 
    // |6| Store second batch in the secrets object
    
    if (data?.Parameters) {
      console.log('› parameters found')
      data.Parameters.forEach((parameter) => {
        const key = path.basename(parameter.Name)
        secrets[key] = parameter.Value
      })
    } else {
      console.log('› parameters not found')
    }
    
    // |7| Pull DB_PROD_HOST from vars file if exists
 
    const pathDbProdHost = path.resolve(secrets.rootPwd, '../../vars/DB_PROD_HOST')
 
    console.log('Checking locally for ../../vars/USE_HTTPS_FROM_S3...')
    try {
      fs.accessSync(pathDbProdHost, fs.f_OK) // throws error or returns undefined
      const readData = fs.readFileSync(pathDbProdHost, 'utf8')
      if (readData) {
        let trimmedData = readData.trimEnd() // remove trailing whitespace
        trimmedData = trimmedData.replace(/:[0-9]+/g, '') // remove port
        secrets.dbProdHost = trimmedData
      }
    } catch (err) {
      console.error('› ../../vars/DB_PROD_HOST not found. Continuing...')
    }
     
    // |8| Create .production.secrets file

    const secretsString = endent(`
      ////
      ///
      // .production.secrets.js
      
      const dbProdDatabaseName = '${secrets.dbProdDatabaseName}'
      const dbProdHost = '${secrets.dbProdHost}'
      const dbProdPassword = '${secrets.dbProdPassword}'
      const dbProdPort = '${secrets.dbProdPort}'
      const dbProdUser = '${secrets.dbProdUser}'
      const hostname = '${secrets.hostname}'
      const jwtAud = '${secrets.jwtAud}'
      const jwtIss = '${secrets.jwtIss}'
      const jwtSubGuest = '${secrets.jwtSubGuest}'
      const jwtSubMain = '${secrets.jwtSubMain}'
      const rootPwd = '${secrets.rootPwd}'
      const secretCookie = '${secrets.secretCookie}'
      const secretJWT = '${secrets.secretJWT}'
      const secretKeyGuest = '${secrets.secretKeyGuest}'
      const secretKeyMain = '${secrets.secretKeyMain}'
      const useDatabase = '${secrets.useDatabase}'
      const useHttpsFromS3 = '${secrets.useHttpsFromS3}'
      const useHttpsLocal = '' // not used in production

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
