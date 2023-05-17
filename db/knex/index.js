/* eslint-disable */
//
// knex › index.js
//
let env = process.env.TRUE_ENV || 'development'
env = env.replace('-hot', '')
env = env.replace('-local', '')
const config = require('../conf/knexfile')[env]

module.exports = require('knex')(config)

// import knex from 'knex'

// import knexConfig from '../conf/knexfile'

// let env = process.env.TRUE_ENV || 'development'
// env = env.replace('-hot', '')
// const knexConfigForEnv = knexConfig[env]

// export default knex(knexConfigForEnv)
