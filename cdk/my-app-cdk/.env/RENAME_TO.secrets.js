//
// .secrets.js
//

// Required
const cdkAppName = 'my-app'
const cdkArtifactS3Region = ''
const cdkGitHubConnectionArn = ''
const cdkGitHubOwner = ''
const cdkGitHubRepo = ''
const cdkGitHubRepoBranch = ''
const cdkHostedZoneId = ''
const cdkHostname = ''

// Optional
const cdkHttpsCertificateArn = '' // not recommended; only needed with load balancer
const cdkUseDatabase = '0' // set to '1' to initialize database (also set useDatabase in SSM Parameter Store; see project's .env/.secrets.js)
const cdkUseHttpsFromS3 = '' // set to '1' to use certificates uploaded by create-certs-cdk
const keyPairName = ''

// Required when cdkUseDatabase === '1'
// All `cdkDb*` values must match `dbProd` parameter values set in AWS SSM Parameter Store
// See the project's .env/.secrets.js for details
const cdkDbDatabaseName = 'my_app_db'
const cdkDbPassword = 'change_this_password_right_away!'
const cdkDbPort = '6432'
const cdkDbUser = 'my_app_user'
const cdkSSMDbPasswordPath = '/my-app/prod/dbProdPassword'
const cdkSSMDbPasswordVersion = ''

module.exports = {
  cdkAppName,
  cdkArtifactS3Region,
  cdkDbDatabaseName,
  cdkDbPassword,
  cdkDbPort,
  cdkDbUser,
  cdkGitHubConnectionArn,
  cdkGitHubOwner,
  cdkGitHubRepo,
  cdkGitHubRepoBranch,
  cdkHostedZoneId,
  cdkHostname,
  cdkHttpsCertificateArn,
  cdkSSMDbPasswordPath,
  cdkSSMDbPasswordVersion,
  cdkUseDatabase,
  cdkUseHttpsFromS3,
  keyPairName,
}
