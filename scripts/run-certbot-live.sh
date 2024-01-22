#!/bin/bash
#
# run-certbot-live.sh
# Automates refreshing TLS certificates on a running EC2 instance and uploading them to S3.

# PREPARATIONS:
# |1|  Decide whether to use parameters in SSM Parameter Store (safer)
#      or to hardcode values in this file; 
# |2a| If using Parameter Store, set the following values and follow the instructions:
USE_SSM_PARAMETERS='true' # 'true' to use SSM Parameters
CDK_CERT_SSM_REGION='us-west-2' # region where SSM Parameters are stored
#
#     Put these parameters in SSM Parameter Store:
#
#     Contact email with Let's Encrypt:
#     $ aws ssm put-parameter \
#       --name '/portfolio-site/certs/cdkCertEmail' \
#       --value 'YOUR_EMAIL' \
#       --type 'SecureString'
#
#     Region for S3 bucket to store https certificates:
#     $ aws ssm put-parameter \
#       --name '/portfolio-site/certs/cdkCertS3Region' \
#       --value 'YOUR_S3_REGION' \
#       --type 'SecureString'
#
#     Desired Primary Domain (CN):
#     $ aws ssm put-parameter \
#       --name '/portfolio-site/certs/cdkCertPrimaryDomain' \
#       --value 'YOUR_PRIMARY_DOMAIN' \
#       --type 'SecureString'
#
#     (optional) One optional secondary domain:
#     $ aws ssm put-parameter \
#       --name '/portfolio-site/certs/cdkCertOneSecondaryDomain' \
#       --value 'YOUR_ONE_ADDITIONAL_DOMAIN' \
#       --type 'SecureString'
#
# |2b| If not using SSM Parameters, hardcode the values in step |4|
# |3| Verify certbot options are as desired in step |12|
# |4| Change the following variables only if customized:
EC2_USER="ubuntu"
EC2_USER_HOME="/home/ubuntu"

# |0| Set errexit and start time
set -e # enable errexit
START_TIME=$(date +%s)

# |1| Prepare formatting variables
# colors
blue="\033[0;34m"
color_reset="\033[0m"
cyan="\033[0;36m"
green="\033[0;32m"
red="\033[0;31m"
white="\033[0;37m"
# content
arrow="\xE2\x86\x92"
chevron="\xE2\x80\xBA"
error="error"
info="info"
success="Success!"

# |2| Verify site server is already running
echo "Checking whether site server is already running..."
set +e # disable errexit
pm2 describe server &> /dev/null
EXIT_CODE_PM2_PID_SERVER=$? 
set -e
if [[ $EXIT_CODE_PM2_PID_SERVER -ne 0 ]]; then
  echo -e "$chevron Server is not running in pm2"
  echo ""
else
  echo -e "$red$chevron$color_reset Server found running in pm2"
  echo ""
  
  # Confirm stopping the site server is acceptable
  CONFIRM="";
  echo -e "Proceeding will temporarily stop the site server to request a TLS certificate with ${cyan}certbot$color_reset."
  echo -ne "Do you wish to proceed ${cyan}(y/n)?$color_reset "
  read confirm
  if [[ ! ( "$confirm" == "y" || "$confirm" == "Y" ) ]]; then
    echo "Aborted"
    echo ""
    exit 1
  fi

  # Stop the server
  echo ""
  echo "Stopping server..."
  pnpm stop
fi

# |3| Confirm backing up existing certificates is acceptable
CONFIRM="";
echo ""
echo "If existing certificates are found on S3, they will remain available as earlier versions of their objects."
echo "If existing certificates are found locally, they will be backed up and timestamped in their respective locations."
echo -ne "Do you wish to proceed ${cyan}(y/n)?$color_reset "
read confirm
if [[ ! ( "$confirm" == "y" || "$confirm" == "Y" ) ]]; then
  echo "Aborted"
  echo ""
  exit 1
fi

# |4| Check AWS CLI is installed
echo ""
echo "Verifying AWS CLI is installed..."
if ! command -v aws &> /dev/null; then
  echo ""
  echo -e "$red$error$color_reset AWS CLI command (aws) could not be found"
  exit 1
else
  echo -e "$chevron Installed"
fi

# |5| Checking AWS credentials can access S3
echo ""
echo "Checking AWS credentials can access S3..."
set +e # disable errexit
aws s3 ls 1> /dev/null
exitCodeAwsS3Ls=$?
if [[ $exitCodeAwsS3Ls -ne 0 ]]; then
  echo ""
  echo -e "$red$error$color_reset AWS credentials failed to access S3 with code: $exitCodeAwsS3Ls"
  echo -e "$blue$info$color_reset  Run$cyan aws configure$color_reset to set credentials for AWS CLI"
  exit 1
else
  echo -e "$chevron AWS credentials can access S3"
fi
set -e # reenable errexit

# |6| Configure these CDK_CERT variables in AWS SSM Parameter Store or here
if [[ $USE_SSM_PARAMETERS == 'true' ]]; then

  echo ""
  echo "Using parameters from AWS SSM Parameter Store..."
  set +e # disable errexit

  # |6.A| Set these parameters in AWS SSM parameter store like so:
  # 
  # $ aws ssm put-parameter \
  #   --name '/portfolio-site/certs/cdkCertEmail' \
  #   --value 'YOUR_EMAIL' \
  #   --type 'SecureString'
  #
  # $ aws ssm put-parameter \
  #   --name '/portfolio-site/certs/cdkCertS3Region' \
  #   --value 'YOUR_S3_REGION' \
  #   --type 'SecureString'
  #
  # $ aws ssm put-parameter \
  #   --name '/portfolio-site/certs/cdkCertPrimaryDomain' \
  #   --value 'YOUR_PRIMARY_DOMAIN' \
  #   --type 'SecureString'
  #
  # (optional)
  # $ aws ssm put-parameter \
  #   --name '/portfolio-site/certs/cdkCertOneSecondaryDomain' \
  #   --value 'YOUR_ONE_ADDITIONAL_DOMAIN' \
  #   --type 'SecureString'

  CDK_CERT_EMAIL=$(aws ssm get-parameter \
    --name '/portfolio-site/certs/cdkCertEmail' \
    --with-decryption \
    --query 'Parameter.Value' \
    --output text \
    --region $CDK_CERT_SSM_REGION)
  [[ $? -ne 0 ]] && echo "" \
    && echo -e "$red$error$color_reset CDK_CERT_EMAIL parameter not found in SSM" \
    && exit 1
  echo -e "$arrow CDK_CERT_EMAIL: $CDK_CERT_EMAIL"

  CDK_CERT_S3_REGION=$(aws ssm get-parameter \
    --name '/portfolio-site/certs/cdkCertS3Region' \
    --with-decryption \
    --query 'Parameter.Value' \
    --output text \
    --region $CDK_CERT_SSM_REGION)
  [[ $? -ne 0 ]] && echo "" \
    && echo -e "$red$error$color_reset CDK_CERT_S3_REGION parameter not found in SSM" \
    && exit 1
  echo -e "$arrow CDK_CERT_S3_REGION: $CDK_CERT_S3_REGION"

  CDK_CERT_PRIMARY_DOMAIN=$(aws ssm get-parameter \
    --name '/portfolio-site/certs/cdkCertPrimaryDomain' \
    --with-decryption \
    --query 'Parameter.Value' \
    --output text \
    --region $CDK_CERT_SSM_REGION)
  [[ $? -ne 0 ]] && echo "" \
    && echo -e "$red$error$color_reset CDK_CERT_PRIMARY_DOMAIN parameter not found in SSM" \
    && exit 1
  echo -e "$arrow CDK_CERT_PRIMARY_DOMAIN: $CDK_CERT_PRIMARY_DOMAIN"

  # (optional)
  CDK_CERT_ONE_SECONDARY_DOMAIN=$(aws ssm get-parameter \
    --name '/portfolio-site/certs/cdkCertOneSecondaryDomain' \
    --with-decryption \
    --query 'Parameter.Value' \
    --output text \
    --region $CDK_CERT_SSM_REGION 2> /dev/null)
  [[ ! -z "$CDK_CERT_ONE_SECONDARY_DOMAIN" ]] && echo -e "$arrow CDK_CERT_ONE_SECONDARY_DOMAIN: $CDK_CERT_ONE_SECONDARY_DOMAIN"
  
  set -e # reenable errexit
else

  echo ""
  echo "Using hardcoded CDK_CERT values..."

  # |6.B| Or hardcode these values

  CDK_CERT_EMAIL=
  CDK_CERT_S3_REGION=
  CDK_CERT_PRIMARY_DOMAIN=
  # (optional)
  CDK_CERT_ONE_SECONDARY_DOMAIN=

  echo -e "$arrow CDK_CERT_EMAIL: $CDK_CERT_EMAIL"
  echo -e "$arrow CDK_CERT_S3_REGION: $CDK_CERT_S3_REGION"
  echo -e "$arrow CDK_CERT_PRIMARY_DOMAIN: $CDK_CERT_PRIMARY_DOMAIN"
  [[ ! -z "$CDK_CERT_ONE_SECONDARY_DOMAIN" ]] && echo -e "$arrow CDK_CERT_ONE_SECONDARY_DOMAIN: $CDK_CERT_ONE_SECONDARY_DOMAIN"
fi

# |7| Combine primary and secondary domains into single comma-separated string
if [[ -z "$CDK_CERT_ONE_SECONDARY_DOMAIN" ]]; then
  CDK_CERT_ALL_DOMAINS="$CDK_CERT_PRIMARY_DOMAIN"
else
  CDK_CERT_ALL_DOMAINS=${CDK_CERT_PRIMARY_DOMAIN},${CDK_CERT_ONE_SECONDARY_DOMAIN}
fi

# |8| Check whether secure-certificates bucket already exists
echo ""
echo "Checking for existing secure-certificates bucket..."
bucketName=$(aws s3api list-buckets \
  --query 'Buckets[?starts_with(Name, `secure-certificates-`) == `true`].[Name]' \
  --output text \
  | head -n 1)

# |9| Create secure-certificates bucket if it doesn't exist
if [[ -z $bucketName ]]; then

  echo "Configuring bucket name beginning with secure-certificates-..."

  # |9.1| Generate the bucket name
  rand35=$(cat /dev/urandom | tr -dc 'a-z0-9' | fold -w 35 | head -n 1)
  bucketName="secure-certificates-$rand35"
  echo -e "$chevron Generated bucket name $bucketName"

  # |9.2| Create a versioned bucket in the proper region
  echo ""
  echo "Attempting to create bucket..."
  aws s3 mb s3://$bucketName --region $CDK_CERT_S3_REGION
  aws s3api put-public-access-block \
    --bucket $bucketName \
    --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
  aws s3api put-bucket-versioning \
    --bucket $bucketName \
    --versioning-configuration Status=Enabled

  echo -e "$chevron Created versioned bucket in $CDK_CERT_S3_REGION called $bucketName"
else
  echo -e "$chevron Found existing secure-certificates bucket"
fi

# |10| Backup local certificates and keys if they exist
echo ""
echo "Backing up existing local certificates and keys..."
GLOBAL_CERT_PATH=/etc/letsencrypt/live/$CDK_CERT_PRIMARY_DOMAIN
GLOBAL_BACKUPS_PATH=/etc/letsencrypt/backups
APP_CERT_PATH=$EC2_USER_HOME/server/.certificates
TIMESTAMP=$(date +%Y-%m-%d-%H%M%S)
if (sudo test -d $GLOBAL_CERT_PATH); then
  sudo mkdir -p ${GLOBAL_BACKUPS_PATH}/$TIMESTAMP
  sudo mv /etc/letsencrypt/accounts ${GLOBAL_BACKUPS_PATH}/$TIMESTAMP/
  sudo mv /etc/letsencrypt/archive ${GLOBAL_BACKUPS_PATH}/$TIMESTAMP/
  sudo mv /etc/letsencrypt/live ${GLOBAL_BACKUPS_PATH}/$TIMESTAMP/
  sudo mv /etc/letsencrypt/renewal ${GLOBAL_BACKUPS_PATH}/$TIMESTAMP/
  sudo mv /etc/letsencrypt/renewal-hooks ${GLOBAL_BACKUPS_PATH}/$TIMESTAMP/
fi
sudo chown -R $EC2_USER:$EC2_USER $APP_CERT_PATH
if [[ -e $APP_CERT_PATH/fullchain.pem || -e $APP_CERT_PATH/privkey.pem ]]; then
  APP_BACKUPS_PATH=$APP_CERT_PATH/backups/$TIMESTAMP
  mkdir -p $APP_BACKUPS_PATH
  [[ -e $APP_CERT_PATH/fullchain.pem ]] && mv $APP_CERT_PATH/fullchain.pem $APP_BACKUPS_PATH/
  [[ -e $APP_CERT_PATH/privkey.pem ]] && mv $APP_CERT_PATH/privkey.pem $APP_BACKUPS_PATH/
fi

# |11| Install certbot
# |11.1| Ensure snapd is up-to-date
echo "Updating snapd..."
sudo snap install core; sudo snap refresh core

# |11.2| Install certbot
echo "Installing certbot..."
sudo snap install --classic certbot

# |11.3| Link certbot into PATH
[[ ! -e /usr/bin/certbot ]] && sudo ln -s /snap/bin/certbot /usr/bin/certbot

# |12| Generate certificate and key with certbot and provided configuration
# See https://eff-certbot.readthedocs.io/en/stable/using.html#certbot-command-line-options
# Outputs:
# - /etc/letsencrypt/live/$CDK_CERT_PRIMARY_DOMAIN/fullchain.pem
# - /etc/letsencrypt/live/$CDK_CERT_PRIMARY_DOMAIN/privkey.pem
echo "Running certbot to generating certificate and key with provided configuration..."
sudo certbot \
  certonly \
  --standalone \
  --non-interactive \
  --agree-tos \
  --email $CDK_CERT_EMAIL \
  --no-eff-email \
  --no-autorenew \
  --domain $CDK_CERT_ALL_DOMAINS
# --register-unsafely-without-email \
# --config-dir /tmp/config-dir/ \
# --work-dir /tmp/work-dir/ \
# --logs-dir /tmp/logs-dir/ \
# --strict-permissions \
# --manual-auth-hook /path/to/http/authenticator.sh \
# --manual-cleanup-hook /path/to/http/cleanup.sh

# |13| Verify certificate and key are created
echo ""
echo "Verifying certificate and key were created successfully..."
if ! (sudo test -e $GLOBAL_CERT_PATH/fullchain.pem \
      && sudo test -e $GLOBAL_CERT_PATH/privkey.pem); then
  echo ""
  echo -e "$red$error$color_reset Certificate and key not found at $GLOBAL_CERT_PATH"
  exit 1
fi

# |14| Link certificate and key to app certificates directory
sudo ln -f $(sudo readlink -f $GLOBAL_CERT_PATH/fullchain.pem) $APP_CERT_PATH/fullchain.pem
sudo ln -f $(sudo readlink -f $GLOBAL_CERT_PATH/privkey.pem) $APP_CERT_PATH/privkey.pem
sudo chown -R $EC2_USER:$EC2_USER $APP_CERT_PATH

# |15| Upload certificate and key to s3 bucket
echo ""
echo "Uploading $CDK_CERT_PRIMARY_DOMAIN/fullchain.pem to S3..."
aws s3 cp \
  $APP_CERT_PATH/fullchain.pem \
  s3://$bucketName/$CDK_CERT_PRIMARY_DOMAIN/fullchain.pem

echo "Uploading $CDK_CERT_PRIMARY_DOMAIN/privkey.pem to S3..."
aws s3 cp \
  $APP_CERT_PATH/privkey.pem \
  s3://$bucketName/$CDK_CERT_PRIMARY_DOMAIN/privkey.pem

# |16| Restart the server if previously stopped
if [[ $EXIT_CODE_PM2_PID_SERVER -eq 0 ]]; then
  echo ""
  echo "Restarting the server..."
  pnpm start
fi

# |17| Success
END_TIME=$(date +%s)
RUN_TIME=$((END_TIME - START_TIME))
echo ""
echo "Done in ${RUN_TIME}s."
