# create-certs-cdk TLS Certificate Request Helper for NextKey AWS Starter

## Overview

This cdk project uses [Certbot](https://certbot.eff.org) to request a TLS certificate for your project.

**Creating a TLS Certificate for the First Time**. Running `pnpm cdk:full` when in the *cdk/create-certs-cdk* directory will request a new TLS certificate and upload it to a special S3 bucket by spinning up a standalone EC2 instance, associating it with your domain's Route 53 Hosted Zone in an Alias record, calling Certbot to request the TLS certificate files, then uploading them to S3.

**Updating an Existing TLS Certificate**. All TLS certificates expire after **3 months**. Refreshing the expiry date for  an existing TLS certificate should *not* be handled with this cdk project. Follow the method described in the section below, which involves SSHing into the site's running EC2 instance and invoking a script, to request a fresh TLS certificate for your domain.

Use the steps provided in the two sections below to request or update your TLS certificate according to your needs:

1.  [Creating a TLS Certificate for the First Time](#1-creating-a-tls-certificate-for-the-first-time)
2.  [Updating an Existing TLS Certificate](#2-updating-an-existing-tls-certificate)

## |1| Creating a TLS Certificate for the First Time

1.  Navigate to `cdk/create-certs-cdk/`
2.  Set the required `CDK_CERT_` values in `.env/.secrets.js`
3.  Decide to store values in **SSM Parameter Store** or to hardcode them in a file, then follow the instructions accordingly in `user-data/run-certbot.sh`
4.  Run `pnpm cdk:full` and follow any instructions
5.  (optional) After the stack is successfully created, wait two minutes then check the S3 console to confirm the creation and upload of TLS certificate files. 
6.  When successfully complete, **destroy** the stack by running `pnpm cdk:destroy`
7.  Set `useHttpsFromS3` to `'1'` in `cdk/my-app-cdk/.env/.secrets.js` and in `.env/.secrets.js`
8.  When the main app is ready, deploy it to AWS by running `pnpm cdk:full` in `cdk/my-app-cdk`. It will automatically serve the site over https (and redirect http traffic to https) using the TLS certificates uploaded to S3.

## |2| Updating an Existing TLS Certificate

All TLS certificates **expire after 3 months**. Before the 3 month period ends, manually refresh the app's TLS certificate files using the automated method described in this section.

### Requirements

1.  Currently have deployed a site on an EC2 instance with this starter's main app cdk project
2.  Understand the site will be briefly inaccessible during this maintenance period

### High-Level Overview

1.  Connect (ex: via SSH) to the site's EC2 instance
2.  Manually run an included certbot script that requests refreshed TLS certificate files, replaces (and backs up) existing files with them on the server and on S3, and stops and restarts the PM2 server before and after if applicable.

### Steps

1.  Connect (ex: via SSH) to the site's EC2 instance.
    -   One way is to connect via SSH following these steps:
        1.  First, in the file *cdk/my-app-cdk/.env/.secrets.js*, specify the name of an existing EC2 Key Pair for `keyPairName`
        2.  Ensure the site is deployed via the main app cdk project in *cdk/my-app-cdk* after setting this secret value
        3.  Next, open the SSH port on the running EC2 instance by following these steps:
            1.  In **EC2 Console**, click into the running EC2 instance
            2.  Scroll down and click the **Security** tab, then click the link under the heading **Security groups**
            3.  Click **Edit inbound rules**
            4.  Click **Add rule**
            5.  For **Type info**, select **SSH**
            6.  For **Source**, select either **Anywhere-IPv4** or **My IP**
            7.  Optionally specify a **Description**
            8.  Click **Save rules**
        4.  Finally, find online and follow the AWS documentation for connecting to the running EC2 instance according to your system environment and setup
2.  On the running EC2 instance, run the certbot TLS certificate request script with the command:

    ```sh
    $ /home/ubuntu/server/my-app/scripts/run-certbot-live.sh
    ```
    
3.  Answer the prompts shown, including confirming an understanding that the site will briefly be down while certbot requests the TLS certificate
4.  Once the script completes, confirm success in two places:
    1.  Visit your site in a browser and view the TLS certificate. Confirm the expiry date is 3 months from the current date.
    2.  Open the **S3 console** and confirm the *fullchain.pem* and *privkey.pem* files in the *secure-certificates-* bucket for your domain were just created.
