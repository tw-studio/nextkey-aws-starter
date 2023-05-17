<p><img src=".readme/nextkey.png" alt="NextKey logo banner" width="800" /></p>

[NextKey](https://github.com/tw-studio/nextkey-aws-starter) is a **project starter** that streamlines deploying password-protected [Next.js](https://nextjs.org) applications to AWS. The NextKey portal is a flexible **password protection system** which allows you to host different versions of a website on a single domain, with each version accessible via a unique password.

<br />

* [Why NextKey?](#why-nextkey)
* [Features](#features)
* [Getting Started](#getting-started)
* [Password Variations](#password-variations)
* [Preparing the AWS Prerequisites](#preparing-the-aws-prerequisites)
* [Testing](#testing)
* [Optional Features](#optional-features)
* [Appendix: Full Stack](#appendix-full-stack)
* [Acknowledgments](#acknowledgments)

<br />

## 🔑 Why NextKey? 🔑

Protecting a new site with NextKey can be useful in scenarios such as:

1.  **Prototype development**. Easily get feedback on different versions of a website by sharing the corresponding password.
2.  **Personal/private site**. Protect your personal domain and limit access to you and people you know. You can host different subsites on your personal domain, and unlock each one with a specific password.

Beyond password protection, this starter takes care of key aspects of deploying a secure Next.js application to AWS such as provisioning a **secure EC2 instance**, requesting a **TLS certificate**, configuring a **CI/CD pipeline**, and **serving your site** at your owned domain.

All resources provisioned by the CDK stack **run for free** under the AWS Free Tier (for 12 months). Your costs are the domain name and associated Route 53 Hosted Zone, which are required to secure your infrastructure behind HTTPS (domain names run around *$10/year*; a Hosted Zone is *$0.50/month*).

## Features

* **Password Protection**: Host different subsites, or different versions of a website, on a single domain, with each accessible via a unique password. Secured with a signed **JSON Web Token (JWT)**.
* **Requesting TLS (HTTPS):** Automates requesting a TLS certificate for your domain and securely uploading to S3. Your EC2 instance will download the TLS certificate from S3 and use it to securely launch a HTTPS server.
* **Route53 Hosting:** NextKey automates connecting your EC2 instance to your Route53 Hosted Zone to serve your website at your owned domain.
* **CI/CD Pipeline:** Connects your GitHub repository to a CodePipeline which will continuously deploy new changes to your app.
* **Modern Styling with Stitches**: Stitches.dev is a modern CSS-in-JS framework with near-zero runtime and first-class support for tokens.
* **Unit and End-to-End Testing:** NextKey includes Jest for unit testing and Testcafe for end-to-end testing.

## Getting Started

### Prerequisites

To try it locally, you will need:

*   `zsh` or `bash`
*   `wget` or `curl`
*   `rename`
*   `node` *(v18.x.x)*
*   `pnpm` *(v1.x)*

Optionally, to set up with an AWS database, you will need:
*   *Docker Engine* installed and running

Later, to deploy to AWS, you will need:

1.  An **AWS account** created
2.  **AWS CLI** configured
3.  A **domain name** purchased in or imported into Amazon Route 53
4.  A Route 53 **Hosted Zone** created for domain name
5.  **Connection to GitHub** account/repo created in AWS Dev Tools
6.  (Optional) **HTTPS certificate** created or imported in AWS Certificate Manager (Not recommended: only use when load balancer is needed. Requires uncommenting code in `cdk/my-app-cdk/my-app-cdk-stack.ts`. Adds additional cost after AWS Free Tier.)

(See [Preparing the AWS Prerequisites](#preparing-the-aws-prerequisites) for a detailed walkthrough)

### Installation

1.  `cd` to a project directory
2.  Run the install script via `wget` or `curl`:

    ```sh
    # (optionally replace zsh with bash)

    # wget
    $ zsh <(wget -qO- https://raw.githubusercontent.com/tw-studio/nextkey-aws-starter/main/scripts/create-nextkey-app.zsh)

    # curl
    $ zsh <(curl -fsSo- https://raw.githubusercontent.com/tw-studio/nextkey-aws-starter/main/scripts/create-nextkey-app.zsh)
    ```

### Try the NextKey portal locally

The starter is configured with **two variations** to start, initially called **main** and **guest**. These correspond to the pages stored under `src/pages/_main/` and `src/pages/_guest/` respectively. The correct password entered into the textbox will serve either the **main** or **guest** variation.

To try this locally:

1.  First, run the setup script and follow any instructions that appear:

    ```sh
    $ pnpm dev:setup
    ```

2.  Once all setup steps are complete, build the project and serve it locally in development mode by running:

    ```sh
    $ pnpm serve:dev
    ```

3.  Visit http://localhost:3000 in a browser
4.  Try a few inputs
5.  Enter `main secret` to access the **main** app variation
6.  In the same tab, navigate to http://localhost:3000/enter via the address bar
7.  Enter `guest secret` to access the **guest** variation
8.  To stop the custom Express server, it is not enough to stop the foreground process as it is run with `pm2` as a background process. Instead, run:

    ```sh
    $ pnpm stop
    ```

### Try the variations directly

For faster development cycles, the development server can bypass the NextKey portal page and serve the desired app variation directly. Additionally, doing so will enable **hot reloading**, so that app code changes reflect in the browser immediately.

To run the **main** variation directly:

1.  Run:

    ```sh
    $ pnpm dev      # same as pnpm dev:main
    ```

2.  Visit http://localhost:4000

To run the **guest** variation:

1.  Run:

    ```sh
    $ pnpm dev:guest
    ```

2.  Visit http://localhost:4000

To stop the hot reloading server, simply stop the foreground process with `Ctrl-C`.

### Use https locally

By default, both development servers will run in *http*, not *https*. The starter simplifies the setup for **local https development**, however, this is true only for the **custom server** (started with `pnpm serve:dev` or `pnpm start:dev`, *not* the hot reloading server started with `pnpm dev`). 

Steps to use https locally:

1.  Run `pnpm https:local:setup` and follow any instructions
2.  Run `mkcert -install` if directed to do so in the output from step 1. Enter the *Sudo password* when prompted. 
3.  Run `pnpm serve:dev` (or `pnpm start:dev` if pages are already built) to serve locally with *https*
4.  Visit the app in the browser at https://localhost:3000

### Deploy to production with AWS CDK & AWS CodePipeline

This starter streamlines your deployment to a fully functional and secure stack hosted on AWS and set up for **Continuous Deployment**. Your `cdk/my-app-cdk/` directory contains *Infrastructure as Code (IaC)*, a complete infrastructure stack written with the **AWS Cloud Development Kit (CDK)**, which defines and configures AWS elements in TypeScript. 

Once your AWS prerequisites are set up, the entire first-time stack and code deployment takes **less than 10 minutes**. All resources created by the stack **run for free** under the AWS Free Tier (which lasts 12 months from account creation) when no other resources are also running (in particular other Load Balancers, EC2, or RDS instances).

Here are the steps:

1.  Change directory to `cdk/my-app-cdk/`
2.  Run `pnpm cdk:precheck` or manually rename `RENAME_TO.secrets.js` to `.secrets.js` in `cdk/my-app-cdk/.env/`
3.  Commit & push your new full project directory to a GitHub repo
4.  Ensure the following are prepared for AWS (see [Preparing the AWS Prerequisites](#preparing-the-aws-prerequisites) for a detailed walkthrough):
    1.  An **AWS account** created
    2.  **AWS CLI** configured
    3.  A **domain name** purchased in or imported into Amazon Route 53
    4.  A Route 53 **Hosted Zone** created for domain name
    5.  **Connection to GitHub** account/repo created in AWS Dev Tools
    6.  (Optional) **HTTPS certificate** created or imported in AWS Certificate Manager (Not recommended: only use when load balancer is needed. Requires uncommenting code in `cdk/my-app-cdk/my-app-cdk-stack.ts`. Adds additional cost after AWS Free Tier.)
5.  Set the proper values for these in `cdk/my-app-cdk/.env/.secrets.js`
6.  To serve your web app using free, properly signed **HTTPS** encryption:
    1.  Navigate to `cdk/create-certs-cdk/` 
    2.  Set the required `CDK_CERT_` values in `.env/.secrets.js`
    3.  Decide to store values in **SSM Parameter Store** or to hardcode them in a file, then follow the instructions accordingly in `user-data/run-certbot.sh`
    4.  Run `pnpm cdk:full` and follow any instructions
    5.  (optional) After the stack is successfully created, wait two minutes then check the S3 console to confirm the creation and upload of TLS certificate files. 
    6.  When successfully complete:
        1.  **Destroy** the stack
        2.  Set `useHttpsFromS3` to `'1'` in `cdk/my-app-cdk/.env/.secrets.js` and in `.env/.secrets.js`
7.  Optionally change any project secret defaults in `.env/.secrets.js`
8.  Put all project secrets prefixed with `jwt`, `secret`, or `dbProd` in your AWS SSM Parameter Store per the steps in `.env/.secrets.js`. For example:

    ```sh
    $ aws ssm put-parameter \
      --name '/my-app/prod/jwtSubMain' \
      --value 'jwtSubMain secret' \
      --type 'SecureString'
    ```

9.  From `cdk/my-app-cdk/`, synthesize and deploy your app infrastructure stack with:

    ```sh
    $ pnpm cdk:full
    ```

10. When that's complete, go to **CodePipeline console** and wait until the deployment is fully complete
11. When complete, visit your domain name (using **https**) in a browser
12. Push future changes to master to **continuously deploy** your app to production

### Destroy the CDK stack

While all resources run for free under the Free Tier, it's a good practice to keep usage minimal by **regularly destroying** the **CDK stack** when not actively needing the production deployment:

1.  From `cdk/my-app-cdk/`, run:

    ```sh
    $ pnpm cdk:destroy
    ```

## Password Variations

Your `src/pages/` directory looks like this:

```sh
├── pages/
│   ├── _app.page.tsx
│   ├── _document.page.jsx
│   ├── _guest/
│   │   ├── index.page.tsx
│   │   └── index.spec.ts
│   └── _main/
│       ├── index.page.tsx
│       └── index.spec.ts
```

Notice the two directories `_main/` and `_guest/`. Those are the two default **app variations** that are served for **different passwords**.

*   To visit the pages under `_main/`, type in at the launcher page the default password: `main secret`
*   To visit the pages under `_guest/`, type in at the launcher page the default password: `guest secret`

Once authenticated, the pages you have access to will *only* be those in your permitted directory. For example, after authenticating with `main secret`, you will only be served the pages under `_main/` — though they will appear to be served at the root — and you will not be able to access any pages under `_guest/`.

You may freely add an app variation in the following way:

### Adding an app variation

Let's add an app variation called `cinematic`.

1.  First, create a new directory `_cinematic/` inside `src/pages/`
2.  Next, open `src/middleware.page.ts` and change the following:
    1.  Add the path `_cinematic/` to the array `pathBases`:

        ```js
        const pathBases = [
          '/_main',
          '/_guest',
          '/_cinematic',
        ]
        ```
    
    2.  Extend the first `pathname` check with `pathBases[2]`:

        ```js
        if (
          pathname.startsWith(`${pathBases[0]}`)
          || pathname.startsWith(`${pathBases[1]}`)
          || pathname.startsWith(`${pathBases[2]}`)
        ) {
          return res.rewrite('/404')
        }
        ```
    3.  Add a case to the switch statement like the following:

        ```js
        // ...
        case process.env.JWT_SUB_CINEMATIC:
          return res.rewrite(`${pathBases[2]}${pathname}`)
        // ...
        ```

3.  Now let's add that mystery environment variable and one other. Open `.env/.secrets.js`, and add **two environment variables**:

    ```js
    const jwtSubCinematic = 'cinematic' // a unique permissions identifier that no one will see        
    const secretKeyCinematic = '<PASSWORD>' // the password to access the cinematic variation

    module.exports = {
      // add these:
      jwtSubCinematic,
      secretKeyCinematic,
    }
    ```

4.  Open `.env/common.env.js`, and add **two entries**:

    ```js
    const envCommon = {
      JWT_SUB_CINEMATIC: '',
      SECRET_KEY_CINEMATIC: '',
    }
    ```

5.  Open `.env/production.env.js`, and add:

    ```js
    const {
      jwtSubCinematic,
      secretKeyCinematic,
    } = require('./.production.secrets.js')

    const envProduction = {
      JWT_SUB_CINEMATIC: jwtSubCinematic ?? '',
      SECRET_KEY_CINEMATIC: secretKeyCinematic ?? '',
    }
    ```

6.  Make those same additions to `.env/development.env.js` and `.env/testing.env.js`
7.  With that complete, open `server/index.ts`, initialize the new variables and modify the switch statement in `unlockWithKey()`::

    ```js
    // initializing variables:
    const jwtSubCinematic = process.env.JWT_SUB_CINEMATIC ?? ''
    const secretKeyCinematic = process.env.SECRET_KEY_CINEMATIC ?? ''

    // in unlockWithKey:
    switch (req.body[keyName]) {
      case secretKeyMain:
        jwtSub = jwtSubMain
        break
      case secretKeyGuest:
        jwtSub = jwtSubGuest
        break
      case secretKeyCinematic:
        jwtSub = jwtSubCinematic
        break
      default:
        console.error('Key not recognized') // eslint-disable-line no-console
        res.status(500).send(Strings.msg500ServerError)
    }
    ```

8.  Finally, put the secrets into **SSM Parameter Store** by running:

    ```sh
    $ aws ssm put-parameter --name "/my-app/prod/jwtSubCinematic" --value "<value>" --type "SecureString"
    $ aws ssm put-parameter --name "/my-app/prod/secretKeyCinematic" --value "<value>" --type "SecureString"
    ```

9.  That's it! Run the server locally with `pnpm serve:dev` to try it. Then to test in production, create pages under `_cinematic/`, commit & push your changes to GitHub, wait a few minutes for your changes to deploy, then visit your domain to check the result.

## Preparing the AWS Prerequisites

To configure your app for deployment to AWS, you will need to provide these six values in `cdk/my-app-cdk/.env/.secrets.js`:

```js
const cdkGitHubConnectionArn = ''
const cdkGitHubOwner = ''
const cdkGitHubRepo = ''
const cdkGitHubRepoBranch = ''
const cdkHostedZoneId = ''
const cdkHostname = ''
```

You will know these values after these **six steps**:

### `|1|` Create an AWS account

Here's an overview of the first steps: [Prerequisites to use the AWS CLI version 2 | AWS](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html)

1.  Go to [AWS sign up](https://portal.aws.amazon.com/billing/signup) and create an account for free.
    *   *Note:* Billing details are required, but all resources created by the included CDK stack will **run for free** under the [AWS Free Tier](https://aws.amazon.com/free/) (which lasts for 12 months from account creation)
2.  *(Optional, but recommended)* Create a non-root **IAM user account** following these steps: [Step 2: Create an IAM user account](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html#getting-started-prereqs-iam)

### `|2|` Configure the AWS Command Line Interface (CLI)

1.  [Step 3: Create an access key ID and secret access key](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html#getting-started-prereqs-keys)
2.  [Install or update the latest version of the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
3.  Run `aws configure` to input your *access key ID* and *secret access key*: [Quick setup](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-quickstart.html)

Your AWS CLI should now be good to go.

### `|3|` Register a Connection to your GitHub repository

1.  First, push your new project to a **GitHub repository**
    *   Your **username** will be `cdkGitHubOwner`
    *   The **repository name** will be `cdkGitHubRepo`
2.  Sign in to the [AWS Console](https://console.aws.amazon.com/console/home)
3.  Use the search box at the top to go to the **CodePipeline console**
4.  In the left nav, expand **Settings**, then choose **Connections**
5.  Click **Create connection**
6.  Choose **GitHub**, then choose **Connect to GitHub**, then follow the instructions
    *   Choosing to authorize a selected repository or all repositories (past and future) is up to you
7.  Back on the **Connections page**, copy the **ARN** to the GitHub Connection just created (this will be `cdkGitHubConnectionARN`)

### `|4|` Purchase or import a domain name in Route 53 ($/year)

*Note:* This step will require an annual fee (*~$10/year*).

1.  Go to the **Amazon Route 53 console**
2.  In the *Dashboard*, scroll to **Register domains**, then either **search availability** for a new domain name or choose **transfer your existing domains**
3.  Follow the instructions until you own or have transferred a domain name
4.  Record the domain name in `cdkHostname` (e.g. `const cdkHostname = 'yourdomain.com'`).

### `|5|` Create a Route 53 Hosted Zone for your domain ($0.50/month)

*Note:* This step will cost *$0.50/month* with low traffic.

1.  Go to the **Amazon Route 53 console**
2.  In the left nav, choose **Hosted zones**
3.  Choose **Create hosted zone**
4.  Type in the **domain name**, then choose **Create hosted zone**
5.  Once created, enter the new hosted zone entry details
6.  Expand the **Hosted zone details**
7.  Copy the **Hosted zone ID** into `cdkHostedZoneId`

*Note:* To **stop charges**, you must **delete** the hosted zone.

### (Optional / Not Recommended) `|6|` Create (or import) an HTTPS Certificate in AWS Certificate Manager (ACM)

*Not recommended: Only use when load balancer is needed. Requires uncommenting code in `cdk/my-app-cdk/my-app-cdk-stack.ts`. Adds additional cost after AWS Free Tier.*

1.  Go to the **AWS Certificate Manager (ACM) console**
2.  Choose either **Request a certificate** or **Import a certificate** (either service is **free**)
3.  Follow the instructions until you have an HTTPS Certificate in AWS Certificate Manager
4.  Copy its **ARN** into `cdkHttpsCertificateArn`

## Testing

The starter includes **Jest unit tests** and **Testcafe integration tests**.

### Jest (unit tests)

Run the included **Jest unit tests** with:

```sh
$ pnpm jest             # runs all tests (same as pnpm jest:all)
$ pnpm jest:app         # only runs tests under src/
```

Check *package.json* for scripts starting with `jest:` for all available Jest tests.

### Testcafe (integration tests)

Testcafe can run **integration tests** in an actual (headless) browser. It supports **several browsers**, including Chrome, Firefox, and Safari.

1.  First, start the server. You can do it one of two ways:

    ```sh
    $ pnpm dev          # starts hot reloading src/pages/_main/ at http://localhost:4000
    $ pnpm start:test   # requires 'pnpm build:all:test' first; runs at https://localhost:3000
    $ pnpm serve:test   # runs 'pnpm build:all:test' and 'pnpm start:test'; runs at https://localhost:3000
    ```

2.  Depending on how you started the server, run `testcafe`:

    ```sh
    $ pnpm testcafe       # test against http://localhost:4000
    $ pnpm testcafe:main  # test against https://localhost:3000
    ```

### PR Tests

GitHub will automatically run **PR tests** via the included [GitHub Actions](https://docs.github.com/en/actions/learn-github-actions) workflow when creating a new Pull Request into the *main* branch.

## Optional Features

### Database and data models

This starter is configured to run and interface with **PostgreSQL** in local development and in production on an AWS RDS instance.

#### Important concepts for included database setup

* This starter is preconfigured for **migration-based database development**. This means all changes to a database are reflected in a sequence of **migration files**. Migration files are checked into a repository along with feature code, which makes the database effectively "versioned" alongside commits and releases.

* The system for running and tracking migrations is enabled by [Flyway](https://flywaydb.org) whose Community version is free to use. As Flyway is Java based, this starter provides scripts to run Flyway commands in a Docker container spun up on demand.

* Interacting with the database in client code is achieved through *Knex.js* database connections and *Objection.js* Model objects (which are built on *Knex.js*).

#### Getting started

Run `pnpm db:dev:setup` to be guided through unmet steps for running a *Postgres* database container locally. This will include:

1.  Set `useDatabase` to `'1'` in *.env/.secrets.js*.
2.  Have *Docker Engine* installed and running.
3.  (Optional) Change `dbDevPassword` in `*.env/.secrets.js* to a different password

The setup script will list several next steps that can be explored:

* Control database migrations with `pnpm db:dev:flyway` commands, ex: `pnpm db:dev:flyway migrate`
* Modify database content and data models in `db/migrations/` and `models/`
* Connect to postgres when needed with `pnpm db:dev:connect:psql`
* Run unit tests on the demo database with `pnpm jest:db`
* Run unit tests on the demo data models with `pnpm jest:models`

#### Example walkthrough

A quick way to understand how all the pieces fit together is with an illustration of a typical workflow of making a change to the database:

1.  You're working on version *0.0.0* of your app. You create a new sql file in `db/migrations` with a title following a very specific format, such as `V0.0.0_0__My_awesome_database.sql` (see [Flyway Migrations](https://flywaydb.org/documentation/concepts/migrations.html) for their naming conventions and requirements).

2.  You write the changes you want to make to your database in *sql*, for example:

    ```sql
    /* V0.0.0_0__My_awesome_database.sql */
    CREATE TABLE IF NOT EXISTS awesome_things (
      awesome_thing_id int GENERATED ALWAYS AS IDENTITY primary key,
      display_name text NOT NULL
    );
    ```

3.  You add an additional sql migration file to insert test content into your database called `V0.0.0_1__TEST_Insert_awesome_things.sql`. Flyway will run migration files **in order** by their version number (in this case, `0.0.0_1` after `0.0.0_0`). For ideas on how to organize release and test migration files separately, see [Organising your migrations](https://flywaydb.org/blog/organising-your-migrations).

4.  You're ready to create your database. You run `pnpm db:dev:setup` (or simply `pnpm dev`) to run Flyway's `migrate` command on a new local Postgres database, all with Docker Compose. The script completes successfully and your local database is initialized and ready to go.

5.  (Optional) You want to interact with the local database directly. You make sure `postgresql` is installed, and you run `pnpm db:dev:connect:psql` to connect to the local database with `psql`. 

6.  In your Next.js pages and components, you interface with your database primarily through Objection.js Models which you create in the `models/` directory. You create `models/AwesomeThings.js`, which defines a model for your database table per the guidelines at [Objection.js](https://vincit.github.io/objection.js/). You sometimes may interface with the database more directly by importing and using the `db/knex` object.

7.  You write your pages' database queries as much as possible inside `getServerSideProps()` to achieve *server-side rendering*. (See [Data Fetching: getServerSideProps](https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props)) 

8.  You run `pnpm dev` to interact with your app in the browser. `pnpm dev` will also run all migrations found in `db/migrations/` on the locally running Postgres container.

9.  You write tests for your database in `db/test/` and tests for your models in `models/`. These will automatically be discovered when running `pnpm jest` and the `pnpm jest:all:` variants. You can also run them specifically with `pnpm jest:db` and `pnpm jest:models`.

10. (Optional) Your database and migration files look good and you're ready to check in your changes. You push your changes to a development branch then create a Pull Request into *main*. This triggers a [GitHub Actions](https://docs.github.com/en/actions) workflow which sets up all dependencies, including Flyway and Postgres, and ultimately runs `pnpm jest:all:PR` to run all discoverable Jest tests.

11. You commit your changes to *main*. Your app is already deployed to AWS via the included CDK stack and it is running a Free Tier RDS PostgreSQL instance. CodePipeline detects your changes in the repository and starts a CodeDeploy deployment. As part of the deployment scripts, a Flyway container is spun up to run `migrate` on your production database. Your database and app code update successfully and your changes are live.

#### Deploying to production

NextKey will take care of initializing a RDS instance qualified for the AWS Free Tier with minimal configuration. The minimal steps are:

1.  Set `useDatabase` to `'1'` in *.env/.secrets.js*
2.  Set `cdkUseDatabase` to `'1'` in *cdk/my-app-cdk/.env/.secrets.js*
3.  Set values for `cdkDb*` variables in *cdk/my-app-cdk/.env/.secrets.js*
4.  Upload those same values to AWS SSM Parameter Store as explained in *.env/.secrets.js*

After these requirements are met, deploying your app's CDK stack will automatically initialize a RDS instance which your deployed app will use.

#### Convenience scripts

*   **Securely connect** to the RDS instance with *psql* from your development machine, run `pnpm db:prod:fwd:rds` in one terminal window, then in another run `pnpm db:prod:fwd:psql`. The first script will set up a secure port forwarding session between your development machine and your ec2 instance. The second script will use this port forwarding to tunnel into your RDS instance with psql.

### Feature flags

This starter includes basic support for **feature flags** to support [trunk-based development](https://trunkbaseddevelopment.com). 

To illustrate, when beginning a new feature, you can:

1.  Add a new flag in `.env/development.flags.js` with name `FLAG_NEW_FEATURE` and set its value to `'on'`:

    ```js
    // .env/development.flags.js
    const flagsDevelopment = {
      FLAG_NEW_FEATURE: 'on',
    }
    ```

    *Note:* Flags' environment variable names must be in **snake uppercase** format and begin with `'FLAG_'`.
    
2.  In app code, write new implementation logic that runs in development mode but **not in production** by surrounding it like in this example:

    ```js
    import * as flag from '../utils/code-flags'

    if (flag.isEnabled('newFeature')) {
      /* Only runs if process.env.FLAG_NEW_FEATURE is set to 'on' */
    }
    else { /*...*/ }
    ```

3.  Alternatively when **testing variants**, use `getVariant()` to check a flag's value directly:

    ```js
    import * as flag from '../utils/code-flags'
    
    if (flag.getVariant('featureWithVariant') === 'blue') {
      /* Only runs if process.env.FLAG_FEATURE_WITH_VARIANT has value 'blue' */
    } else if (flag.getVariant('featureWithVariant') === 'green') {
      /* Only runs if process.env.FLAG_FEATURE_WITH_VARIANT has value 'green' */
    }
    else { /*...*/ }
    ```
    
4.  Commit this code into the trunk knowing it **won't affect production code**.
5.  When ready to **enable in production**, add the appropriate flag in `.env/production.flags.js` and push to remote master:

    ```js
    // .env/production.flags.js
    const flagsProduction = {
      FLAG_NEW_FEATURE: 'on',
    }
    ```

6.  Finally, when the feature is demonstrated to work in production and all is well, remember to **remove this flag's code** to keep things tidy.

## Appendix: Full Stack

-   **Front End**
    *   [Next.js](https://nextjs.org)
-   **Server**
    *   [Express.js](https://expressjs.com)
    *   [Next.js](https://nextjs.org)
-   **Testing**
    *   [Jest](https://jestjs.io)
    *   [Supertest](https://github.com/visionmedia/supertest)
    *   [Mock Service Worker](https://mswjs.io)
    *   [Testcafe](https://testcafe.io)
    *   [GitHub Actions](https://docs.github.com/en/actions)
-   **Database & Data Model**
    *   [Amazon RDS for PostgreSQL](https://aws.amazon.com/rds/postgresql/)
    *   [PostgreSQL](https://www.postgresql.org)
    *   [Flyway](https://flywaydb.org)
    *   [Knex.js](https://knexjs.org)
    *   [Objection.js](https://vincit.github.io/objection.js/)
    *   [Docker](https://www.docker.com)
-   **Infrastructure as Code (IaC)**
    *   [AWS Cloud Development Kit (CDK)](https://aws.amazon.com/cdk/)
-   **Deployment**
    *   [AWS CodeDeploy](https://aws.amazon.com/codedeploy/)
-   **Continuous Delivery**
    *   [AWS CodePipeline](https://aws.amazon.com/codepipeline/)
-   **Compute**
    *   [Amazon EC2](https://aws.amazon.com/ec2/)
    *   [AWS Autoscaling](https://aws.amazon.com/autoscaling/)
-   **Network**
    *   [Amazon VPC](https://aws.amazon.com/vpc/)
    *   [AWS Elastic Load Balancing](https://aws.amazon.com/elasticloadbalancing/)
    *   [Amazon Route 53](https://aws.amazon.com/route53/)
    *   [Certbot (Let's Encrypt)](https://certbot.eff.org)
    *   [AWS Certificate Manager](https://aws.amazon.com/certificate-manager/)
-   **Artifact Storage**
    *   [Amazon S3](https://aws.amazon.com/s3/)
-   **Styles**
    *   [Stitches](https://stitches.dev)
-   **Linting & Formatting**
    *   [ESLint](https://eslint.org)
-   **Code Repository**
    *   [GitHub](https://github.com)
-   **Miscellaneous**
    *   *Environment variables:* [env-cmd](https://github.com/toddbluhm/env-cmd)
    *   *Transpiler:* [Babel](https://babeljs.io)
    *   *Port forwarding*: `socat`

## Acknowledgments

The font used for the NextKey portal page is [PixL](https://www.1001fonts.com/pixl-font.html) by Keith Bates at K-Type Foundry.
