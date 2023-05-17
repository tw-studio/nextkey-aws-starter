//
// production.flags.js
//
// Flag names must start with 'FLAG_'
// Values must be 'on' or 'off'
//
const flagsProduction = {
  NEXT_PUBLIC_FLAG_DEBUG_FONTS: 'on',
  NEXT_PUBLIC_FLAG_DEBUG_MASTER: 'on',
  FLAG_TEST_ON_IN_PRODUCTION: 'on',
  FLAG_TEST_ON_IN_DEVELOPMENT: 'off',
  FLAG_TEST_ON_IN_TEST: 'off',
}

module.exports = flagsProduction